import { useState, useEffect, useRef } from "react";
import { MessageList } from "@/components/Chat/MessageList";
import { ChatInput } from "@/components/Chat/ChatInput";
import http from "@/lib/http";

// 定义消息类型
export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  isLoading?: boolean;
  type: "text" | "audio" | "image";
}

// 模拟AI回复
const generateAIResponse = (userMessage: string): string => {
  const responses = [
    "感谢您的提问！根据您的需求，我认为最适合的解决方案是专注于用户体验设计，同时优化性能指标。您希望我详细解释哪个方面？",
    "这个问题很有意思。从技术角度来看，我们可以采用微服务架构来提高系统的可扩展性，同时使用缓存机制减少响应时间。您对这个方案有什么想法吗？",
    "我理解您的需求了。要实现这个功能，我们需要考虑数据结构设计、API接口规范以及前端状态管理三个主要方面。您希望我先从哪个方面开始分析？",
    "这是一个很好的观点。在实际应用中，我们发现结合机器学习算法和规则引擎可以获得最佳效果。您是否需要我提供一些具体的实现案例？",
    "根据您提供的信息，我建议采用渐进式开发方法，先构建MVP版本验证核心功能，然后根据用户反馈逐步迭代优化。您觉得这个开发策略如何？",
  ];

  // 根据用户消息长度生成不同回复
  const messageLength = userMessage.length;
  return responses[messageLength % responses.length];
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [audioUrl, setAudioUrl] = useState<string>("");

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 发送消息处理函数
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    http
      .post("/chat", {
        // params: { page: 1, size: 10 }
        message: content,
        session_id: "12345678",
      })
      .then((data) => {
        // const { resposne: msg } = data;
        // 添加AI回答的消息
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          content: data,
          sender: "ai",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });

    // 模拟AI思考延迟
    // setTimeout(() => {
    //   // 添加AI回复
    //   const aiMessage: Message = {
    //     id: `ai-${Date.now()}`,
    //     content: generateAIResponse(content),
    //     sender: 'ai',
    //     timestamp: new Date()
    //   };

    //   setMessages(prev => [...prev, aiMessage]);
    //   setIsLoading(false);
    // }, 1500 + Math.random() * 1000);
  };

  // 处理语音消息
  const handleVoiceMessage = (url?: string, audioBlob?: Blob) => {
    // 模拟语音录制和转换
    setIsLoading(true);
    console.log(audioBlob); // 音频Blob对象 未来用于大模型提示词
    // url && setAudioUrl(url);
    // 模拟语音处理延迟
    setTimeout(
      () => {
        const voiceText =
          "这是一条通过语音输入的消息，语音识别功能正在演示中。";

        // 添加用户语音转文字消息
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          content: url || "",
          sender: "user",
          timestamp: new Date(),
          type: "audio",
        };

        setMessages((prev) => [...prev, userMessage]);

        // 请求接口获取答案 
        http
          .post("/chat", {
            // params: { page: 1, size: 10 }
            message: voiceText,
            session_id: "12345678",
          })
          .then((data) => {
            // const { resposne: msg } = data;
            // 添加AI回答的消息
            const aiMessage: Message = {
              id: `ai-${Date.now()}`,
              content: data,
              sender: "ai",
              timestamp: new Date(),
              type: "text",
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error(error);
          });

        // 模拟AI思考延迟
        // setTimeout(() => {
        //   // 添加AI回复
        //   const aiMessage: Message = {
        //     id: `ai-${Date.now()}`,
        //     content: generateAIResponse(voiceText),
        //     sender: "ai",
        //     timestamp: new Date(),
        //     type: "text",
        //   };

        //   setMessages((prev) => [...prev, aiMessage]);
        //   setIsLoading(false);
        // }, 1500 + Math.random() * 1000);
      },
      audioBlob ? 1000 : 2000
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                智能助手
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                在线 · 响应迅速
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <i className="fa-regular fa-star text-gray-500 dark:text-gray-400"></i>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <i className="fa-solid fa-ellipsis-vertical text-gray-500 dark:text-gray-400"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 聊天消息区域 */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <i className="fa-solid fa-comments text-3xl text-blue-500 dark:text-blue-400"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              欢迎使用智能助手
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              我可以回答您的问题，帮助您解决问题。请输入文字或使用语音开始对话。
            </p>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}

        {/* 用于自动滚动到底部的参考元素 */}
        <div ref={messagesEndRef} />

        {/* 正在输入指示器 */}
        {isLoading && (
          <div className="flex items-start mt-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0">
              <i className="fa-solid fa-robot text-blue-500 dark:text-blue-400 text-sm"></i>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 输入区域 */}
      <footer className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
        <ChatInput
          onSendMessage={handleSendMessage}
          onVoiceRecord={handleVoiceMessage}
        />
        {/* {audioUrl && (
          <audio controls src={audioUrl}>
            您的浏览器不支持音频元素
          </audio>
        )} */}
      </footer>
    </div>
  );
}

import { Message } from "@/pages/Home";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUserMessage = message.sender === "user";
  const isText = message.type === "text";
  const isAudio = message.type === "audio";
  const renderContent = () => {
    
    if (isText) {
      return message.content;
    }
    if (isAudio) {
      return (
        message.content?<audio controls src={message.content}>
          您的浏览器不支持音频元素
        </audio>:"音频无数据"
      );
    }
    return "Unknown message type";
  };
  return (
    <div
      className={`flex ${
        isUserMessage ? "justify-end" : "justify-start"
      } animate-fadeIn`}
    >
      {!isUserMessage && (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0">
          <i className="fa-solid fa-robot text-blue-500 dark:text-blue-400 text-sm"></i>
        </div>
      )}

      <div
        className={`max-w-[80%] ${
          isUserMessage ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`
            rounded-lg px-4 py-3 shadow-sm
            ${
              isUserMessage
                ? "bg-blue-500 text-white rounded-tr-none"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none"
            }
          `}
        >
          <p className="whitespace-pre-wrap">{renderContent()}</p>
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {format(message.timestamp, "HH:mm")}
        </span>
      </div>

      {isUserMessage && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ml-3 flex-shrink-0">
          <i className="fa-solid fa-user text-gray-500 dark:text-gray-300 text-sm"></i>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onVoiceRecord: (type:string,url?: string,audioBlob?: Blob) => void;
}

export function ChatInput({ onSendMessage, onVoiceRecord }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 调整文本框高度以适应内容
  useEffect(() => {
    if (textareaRef.current) {
      // 重置高度以获得正确的滚动高度
      textareaRef.current.style.height = "auto";
      // 设置新高度，最大高度限制为120px
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  // 清理函数：停止录音和计时器
  //   useEffect(() => {
  //     return () => {
  //       if (isRecording && mediaRecorderRef.current) {
  //         mediaRecorderRef.current.stop();
  //       }
  //       if (recordingIntervalRef.current) {
  //         clearInterval(recordingIntervalRef.current);
  //       }
  //     };
  //   }, [isRecording]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const startRecording = async (type) => {
    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream,{ mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 开始录音
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setRecordingStatus("正在录音...");
      toast.info("开始录音");

      // 开始计时
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // 处理录音数据
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 录音结束处理
      mediaRecorder.onstop = () => {
        // 停止所有音轨
        stream.getTracks().forEach((track) => track.stop());

        // 创建音频Blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        // 调用父组件回调
        onVoiceRecord(type,url,audioBlob);

        // 保存到本地
        // saveAudioToLocal(audioBlob);

        setIsRecording(false);
        setRecordingStatus(null);
        clearInterval(recordingIntervalRef.current!);
      };

      mediaRecorder.onerror = (error) => {
        console.error("录音错误:", error);
        setRecordingStatus("录音失败");
        toast.error("录音失败，请重试");
      };
    } catch (error) {
      console.error("获取麦克风权限失败:", error);
      setRecordingStatus("无法访问麦克风");
      toast.error("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      toast.info("录音已停止，正在保存...");
    }
    // 停止所有音轨
    // stream.getTracks().forEach((track) => track.stop());

    // 创建音频Blob
    // const audioBlob = new Blob(audioChunksRef.current, {
    //   type: "audio/wav",
    // });

    // // 调用父组件回调
    // onVoiceRecord(audioBlob);

    // // 保存到本地
    // saveAudioToLocal(audioBlob);

    // setIsRecording(false);
    // setRecordingStatus(null);
    // clearInterval(recordingIntervalRef.current!);
  };

  // 保存音频到本地
  const saveAudioToLocal = (audioBlob: Blob) => {
    try {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("语音已保存到本地");
    } catch (error) {
      console.error("保存音频失败:", error);
      toast.error("保存音频失败，请重试");
    }
  };

  // 格式化录制时间
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      {recordingStatus && (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          {recordingStatus}
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入消息..."
          className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={1}
          maxLength={500}
          disabled={isRecording}
        />

        <button
          type="button"
          onClick={isRecording ? stopRecording : ()=>startRecording("audio-text")}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
            isRecording
              ? "bg-red-100 text-red-500 hover:bg-red-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          aria-label={isRecording ? "停止录音" : "开始录音"}
        >
          {isRecording ? (
            <>
              <i className="fa-solid fa-stop"></i>
              <span className="ml-1 text-xs font-medium">
                {formatRecordingTime(recordingTime)}
              </span>
            </>
          ) : (
            <i className="fa-solid fa-microphone"></i>
          )}
        </button>

        <button
          type="button"
          onClick={isRecording ? stopRecording : ()=>startRecording("audio")}
          className={`absolute right-10 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
            isRecording
              ? "bg-red-100 text-red-500 hover:bg-red-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          aria-label={isRecording ? "停止录音" : "开始录音"}
        >
          {isRecording ? (
            <>
              <i className="fa-solid fa-stop"></i>
              <span className="ml-1 text-xs font-medium">
                {formatRecordingTime(recordingTime)}
              </span>
            </>
          ) : (
            <i className="fa-solid fa-microphone"></i>
          )}
          2
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!message.trim() || isRecording}
          className={`px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 ${
            message.trim() && !isRecording
              ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          发送
          <i className="fa-solid fa-paper-plane ml-2"></i>
        </button>
      </div>
    </form>
  );
}

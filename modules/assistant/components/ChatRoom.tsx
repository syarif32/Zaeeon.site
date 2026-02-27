import { HiSparkles, HiUser } from "react-icons/hi2";
import { Message } from "./AIAssistant";
import { RefObject } from "react";

interface ChatRoomProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const ChatRoom = ({ messages, isLoading, messagesEndRef }: ChatRoomProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-400 opacity-60">
          <HiSparkles size={48} className="mb-4" />
          <p className="text-sm font-medium">Mulai percakapan baru dengan Zaeeon...</p>
        </div>
      ) : (
        messages.map((m) => (
          <div key={m.id} className={`flex gap-3 md:gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-gradient-to-br from-teal-400 to-teal-600 text-white"
            }`}>
              {m.role === "user" ? <HiUser size={18} /> : <HiSparkles size={18} />}
            </div>
            
            <div className={`px-5 py-3 rounded-2xl max-w-[85%] md:max-w-[75%] text-[15px] shadow-sm ${
              m.role === "user" 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-tl-none"
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
            </div>
          </div>
        ))
      )}
      
      {isLoading && (
        <div className="flex gap-4 flex-row">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <HiSparkles size={18} />
          </div>
          <div className="px-5 py-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-tl-none shadow-sm flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-neutral-400 rounded-full animate-bounce"></div>
            <div className="w-2.5 h-2.5 bg-neutral-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2.5 h-2.5 bg-neutral-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatRoom;
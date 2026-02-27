import { HiPlus, HiChatBubbleLeftRight, HiOutlineTrash } from "react-icons/hi2";
import { ChatSession } from "./AIAssistant";

interface SidebarHistoryProps {
  sessions: ChatSession[];
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  createNewSession: () => void;
  deleteSession: (e: React.MouseEvent, id: string) => void;
}

const SidebarHistory = ({ sessions, activeSessionId, setActiveSessionId, createNewSession, deleteSession }: SidebarHistoryProps) => {
  return (
    <div className="w-full md:w-1/4 bg-neutral-50 dark:bg-neutral-900/50 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
      <div className="p-4">
        <button 
          onClick={createNewSession}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
        >
          <HiPlus size={18} /> Chat Baru
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 no-scrollbar">
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => setActiveSessionId(session.id)}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
              activeSessionId === session.id 
                ? "bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800" 
                : "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <HiChatBubbleLeftRight className={`flex-shrink-0 ${activeSessionId === session.id ? "text-blue-600 dark:text-blue-400" : "text-neutral-500"}`} />
              <span className={`text-sm truncate ${activeSessionId === session.id ? "font-bold text-blue-700 dark:text-blue-300" : "text-neutral-600 dark:text-neutral-400"}`}>
                {session.title}
              </span>
            </div>
            <button 
              onClick={(e) => deleteSession(e, session.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all"
              title="Hapus Percakapan"
            >
              <HiOutlineTrash size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarHistory;
import { HiPaperAirplane } from "react-icons/hi2";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ChatInput = ({ input, setInput, handleSend, isLoading }: ChatInputProps) => {
  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <form onSubmit={handleSend} className="flex gap-2 relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya tentang keahlian, pengalaman, layanan, atau hal lain seputar Syarif..."
          className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-xl pl-4 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white rounded-lg px-3 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <HiPaperAirplane size={18} className="transform -rotate-45 ml-0.5" />
        </button>
      </form>
      <div className="text-center mt-2 text-[10px] text-neutral-400">
        Zaeeon AI dapat membuat kesalahan. Harap maklumi.
      </div>
    </div>
  );
};

export default ChatInput;
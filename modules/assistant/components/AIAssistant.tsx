"use client";

import { useEffect, useRef, useState } from "react";
import { HiSparkles } from "react-icons/hi2";
import SidebarHistory from "./SidebarHistory";
import ChatRoom from "./ChatRoom";
import ChatInput from "./ChatInput";
import theme from "@/common/stores/theme";
export type Message = { id: string; role: string; content: string };
export type ChatSession = { id: string; title: string; messages: Message[] };

const AIAssistant = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem("zaeeon_chats");
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("zaeeon_chats", JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "Percakapan Baru",
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter((s) => s.id !== id);
    setSessions(updatedSessions);
    if (updatedSessions.length === 0) createNewSession();
    else if (activeSessionId === id) setActiveSessionId(updatedSessions[0].id);
  };

  const updateSession = (id: string, newMessages: Message[], newTitle?: string) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, messages: newMessages, title: newTitle || s.title } : s
    ));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeSessionId) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    let newMessages = [...messages, userMessage];
    
    let updatedTitle = activeSession?.title;
    if (messages.length === 0) {
      updatedTitle = input.length > 20 ? input.substring(0, 20) + "..." : input;
    }

    updateSession(activeSessionId, newMessages, updatedTitle);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.body) throw new Error("Tidak ada respons dari server");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      const aiMessageId = (Date.now() + 1).toString();

      newMessages = [...newMessages, { id: aiMessageId, role: "assistant", content: "" }];
      updateSession(activeSessionId, newMessages);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const cleanChunk = chunk.replace(/^0:"|"$|\\n/g, (match) => match === '\\n' ? '\n' : '').replace(/\\"/g, '"');
        if (cleanChunk.includes('d:{"finishReason"')) continue;

        aiText += cleanChunk;
        
        const finalMessages = newMessages.map(msg => 
          msg.id === aiMessageId ? { ...msg, content: aiText } : msg
        );
        updateSession(activeSessionId, finalMessages);
      }
    } catch (error) {
      console.error("Chat error:", error);
      updateSession(activeSessionId, [...newMessages, { id: "error", role: "assistant", content: "Maaf, sistem sedang sibuk." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex flex-col items-center mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-3 shadow-sm border border-blue-200 dark:border-blue-800">
          <HiSparkles size={28} />
        </div>
       <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">
  Zaeeon AI
</h2>
        <p className="text-neutral-500 text-sm text-center max-w-md mt-2">
          Asisten virtual Syarif yang siap membantu anda untuk mengetahui tentang keahlian, pengalaman, dan proyek portofolio. Silakan tanya apa saja!
        </p>
      </div>

      <div className="flex flex-col md:flex-row h-[600px] border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
        
        <SidebarHistory 
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          createNewSession={createNewSession}
          deleteSession={deleteSession}
        />

        <div className="flex-1 flex flex-col relative">
          <ChatRoom messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
          <ChatInput input={input} setInput={setInput} handleSend={handleSend} isLoading={isLoading} />
        </div>

      </div>
    </section>
  );
};

export default AIAssistant;
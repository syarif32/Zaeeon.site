"use client";

import React, { useState, useRef, useEffect } from "react";

// Tipe data untuk riwayat baris di terminal
type HistoryItem = {
  command: string;
  output: React.ReactNode;
};

export default function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: "",
      output: (
        <span>
          Welcome to Zaeeon Terminal! 🚀<br />
          Type <span className="text-green-400">help</span> to see available commands.
        </span>
      ),
    },
  ]);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  
  const handleWrapperClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let output: React.ReactNode = "";

    switch (trimmedCmd) {
      case "help":
        output = (
          <div className="flex flex-col">
            <span>Available commands:</span>
            <span className="text-green-400">about    <span className="text-gray-400">- Tentang saya</span></span>
            <span className="text-green-400">projects <span className="text-gray-400">- Daftar proyek yang sedang / pernah dikerjakan</span></span>
            <span className="text-green-400">clear    <span className="text-gray-400">- Membersihkan terminal</span></span>
          </div>
        );
        break;
      case "about":
        output = "Halo! Saya seorang Mahasiswa Universitas Dian Nuswantoro Semarang yang sangat tertarik dengan Web & Mobile Development.";
        break;
      case "projects":
        output = (
          <ul className="list-disc list-inside">
            <li>Lapak Siswa - Marketplace produk siswa</li>
            <li>Ritecs - Web project</li>
            <li>Sistem Pencatatan Transaksi F&B</li>
          </ul>
        );
        break;
      case "clear":
        setHistory([]);
        return;
      case "":
        output = "";
        break;
      default:
        output = <span className="text-red-400">Command not found: {cmd}. Type 'help' for a list of commands.</span>;
    }

    setHistory((prev) => [...prev, { command: cmd, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div 
      className="min-h-screen bg-black text-gray-200 font-mono p-4 sm:p-8 cursor-text"
      onClick={handleWrapperClick}
    >
      <div className="max-w-3xl mx-auto">
        {/* Render History */}
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            {item.command && (
              <div className="flex gap-2 text-green-400">
                <span>guest@zaeeon:~$</span>
                <span>{item.command}</span>
              </div>
            )}
            <div className="text-gray-300 mt-1">{item.output}</div>
          </div>
        ))}

        {/* Current Input */}
        <div className="flex gap-2 text-green-400 mt-2">
          <span>guest@zaeeon:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-gray-200 flex-1"
            autoFocus
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
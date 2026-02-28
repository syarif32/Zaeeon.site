"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ABOUT } from "@/common/constants/about";
import { STACKS } from "@/common/constants/stacks";
import { SOCIAL_MEDIA } from "@/common/constants/socialMedia";
import { EDUCATION } from "@/common/constants/education";
import { useSession } from "next-auth/react";

type HistoryItem = {
  command: string;
  output: React.ReactNode;
};

//

const activeSkills = Object.entries(STACKS)
  .filter(([_, value]) => value.isActive)
  .map(([key]) => key)
  .join(", ");

// --- FILE SYSTEM ---
const fileSystem: Record<string, string | React.ReactNode> = {
  "about.txt": (
    <div className="flex flex-col gap-2 mt-1 mb-2 text-gray-300">
      {ABOUT.map((paragraph, idx) => (
        <p key={idx} className="leading-relaxed">{paragraph}</p>
      ))}
    </div>
  ),
  "skills.txt": (
    <div className="mt-1 mb-2 text-gray-300">
      <p className="font-bold text-green-400 mb-1">Tech Stacks yang dikuasai:</p>
      <p className="leading-relaxed">[{activeSkills}]</p>
    </div>
  ),
  "education.txt": (
    <div className="flex flex-col gap-4 mt-1 mb-2">
      {EDUCATION.map((edu, idx) => (
        <div key={idx} className="text-gray-300">
          <p className="font-bold text-green-400">🎓 {edu.school}</p>
          <p className="text-gray-100">{edu.major} • {edu.degree}</p>
          <p className="text-gray-400 text-sm">
            {edu.start_year} - {edu.end_year} | {edu.location}
          </p>
        </div>
      ))}
    </div>
  ),
  "contact.txt": (
    <div className="flex flex-col gap-1 mt-1 mb-2">
      <p className="text-gray-300 mb-1">Let's connect:</p>
      {SOCIAL_MEDIA.map((social, idx) => (
        <div key={idx} className="flex gap-2">
          <span className="font-bold text-blue-400 w-24">{social.name}</span>
          <a
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className="text-gray-300 hover:text-white hover:underline decoration-dotted"
          >
            {social.href}
          </a>
        </div>
      ))}
    </div>
  ),
  "projects.txt": (
    <div className="text-gray-300 mt-1 mb-2">
      <p>1. Lapak Siswa (Marketplace Sekolah)</p>
      <p>2. Ritecs (Web System)</p>
      <p>3. F&B POS System (Laravel & React)</p>
      <p>4. EchoArena</p>
      <p className="mt-2 text-gray-500 italic">Ketik 'open projects' untuk melihat UI aslinya.</p>
    </div>
  ),
};

export default function Terminal() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(0);
  const { data: session } = useSession();
  const username = session?.user?.name || "guest";
  const prompt = `${username}@zaeeon:~$`;
  const [themeClass, setThemeClass] = useState("text-green-500");
  const [themeName, setThemeName] = useState("Hacker Green");

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: "",
      output: (
        <div className="mb-6">
          <pre className="font-bold text-[10px] sm:text-xs md:text-sm drop-shadow-[0_0_5px_currentColor]">
{`
 ███████╗ █████╗ ███████╗███████╗ ██████╗ ███╗   ██╗
╚══███╔╝██╔══██╗██╔════╝██╔════╝██╔═══██╗████╗  ██║
  ███╔╝ ███████║█████╗  █████╗  ██║   ██║██╔██╗ ██║
 ███╔╝  ██╔══██║██╔══╝  ██╔══╝  ██║   ██║██║╚██╗██║
███████╗██║  ██║███████╗███████╗╚██████╔╝██║ ╚████║
╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
`}
          </pre>
          <p className="text-gray-300 mt-2">Welcome to Zaeeon OS v3.1.0 LTS</p>
          <p className="text-gray-400 mt-1">Type <span className="font-bold text-white">'help'</span> to see a list of available commands.</p>
        </div>
      ),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);
  const handleWrapperClick = () => {
    if (window.getSelection()?.toString() === "") {
      inputRef.current?.focus();
    }
  };

  const processCommand = (rawCmd: string) => {
    const args = rawCmd.trim().split(" ").filter(Boolean);
    const cmd = args[0]?.toLowerCase();
    let output: React.ReactNode = "";

    if (!cmd) {
      setHistory((prev) => [...prev, { command: rawCmd, output: "" }]);
      return;
    }

    switch (cmd) {
      case "help":
        output = (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-gray-300 mt-2 mb-2">
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>ls</span> - List files</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>cat</span> - Read file (ex: cat about.txt)</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>neofetch</span> - Show system info</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>theme</span> - Change color (green, blue, pink, white)</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>open</span> - Open link (ex: open github)</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>history</span> - Show command history</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>date</span> - Show current date</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>clear</span> - Clear terminal</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>gui</span> - Go back to normal website</div>
            <div><span className={`w-20 inline-block font-bold ${themeClass}`}>sudo</span> - Administrator privileges</div>
          </div>
        );
        break;
      
      case "ls":
        output = (
          <div className="flex flex-wrap gap-4 text-blue-400 font-bold mt-1 mb-2">
            {Object.keys(fileSystem).map((file) => (
              <span key={file}>{file}</span>
            ))}
          </div>
        );
        break;

      case "cat":
        const fileName = args[1];
        if (!fileName) {
          output = <p className="text-red-400 mt-1 mb-2">Usage: cat &lt;filename&gt;</p>;
        } else if (fileSystem[fileName]) {
          output = fileSystem[fileName];
        } else {
          output = <p className="text-red-400 mt-1 mb-2">cat: {fileName}: No such file or directory</p>;
        }
        break;

      case "neofetch":
        output = (
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-2 mb-4 items-center sm:items-start">
            <div className={`font-bold drop-shadow-[0_0_8px_currentColor] ${themeClass}`}>
              <pre>
{`       /\\
      /  \\
     /    \\
    /      \\
   /   ,,   \\
  /   |  |   \\
 /_-''    ''-_\\`}
              </pre>
            </div>
            <div className="text-gray-300 text-sm sm:text-base flex flex-col gap-1">
              <p><span className={`font-bold ${themeClass}`}>@{username}</span>@<span className={`font-bold ${themeClass}`}>zaeeon</span></p>
              <p>-------------------</p>
              <p><span className={`font-bold ${themeClass}`}>OS</span>: Zaeeon Web OS</p>
              <p><span className={`font-bold ${themeClass}`}>Host</span>: Vercel / Next.js</p>
              <p><span className={`font-bold ${themeClass}`}>Kernel</span>: React 18 / TypeScript</p>
              <p><span className={`font-bold ${themeClass}`}>Uptime</span>: 24/7/365</p>
              <p><span className={`font-bold ${themeClass}`}>Packages</span>: npm / bun</p>
              <p><span className={`font-bold ${themeClass}`}>Shell</span>: Zsh</p>
              <p><span className={`font-bold ${themeClass}`}>Theme</span>: {themeName}</p>
              <p><span className={`font-bold ${themeClass}`}>Author</span>: Syarif</p>
            </div>
          </div>
        );
        break;

      case "theme":
        const newTheme = args[1]?.toLowerCase();
        if (newTheme === "green") {
          setThemeClass("text-green-500");
          setThemeName("Hacker Green");
          output = <p className="text-green-500 mt-1 mb-2">Theme changed to Green.</p>;
        } else if (newTheme === "blue") {
          setThemeClass("text-cyan-400");
          setThemeName("Cyber Blue");
          output = <p className="text-cyan-400 mt-1 mb-2">Theme changed to Blue.</p>;
        } else if (newTheme === "pink") {
          setThemeClass("text-pink-500");
          setThemeName("Vaporwave Pink");
          output = <p className="text-pink-500 mt-1 mb-2">Theme changed to Pink.</p>;
        } else if (newTheme === "white") {
          setThemeClass("text-gray-100");
          setThemeName("Minimal Light");
          output = <p className="text-gray-100 mt-1 mb-2">Theme changed to White.</p>;
        } else {
          output = <p className="text-gray-400 mt-1 mb-2">Available themes: <span className="text-green-500">green</span>, <span className="text-cyan-400">blue</span>, <span className="text-pink-500">pink</span>, <span className="text-gray-100">white</span></p>;
        }
        break;

      case "open":
        const target = args[1]?.toLowerCase();
        if (target === "github") {
          window.open("https://github.com/syarif32", "_blank");
          output = <p className="text-gray-300 mt-1 mb-2">Opening Github...</p>;
        } else if (target === "projects") {
          router.push("/projects");
          output = <p className="text-gray-300 mt-1 mb-2">Opening Projects GUI...</p>;
        } else {
          output = <p className="text-red-400 mt-1 mb-2">Usage: open &lt;github | projects&gt;</p>;
        }
        break;

      case "history":
        output = (
          <div className="text-gray-400 mt-1 mb-2">
            {cmdHistory.map((h, i) => (
              <div key={i}>
                <span className="w-6 inline-block text-right mr-4">{i + 1}</span>
                {h}
              </div>
            ))}
          </div>
        );
        break;

      case "whoami":
        output = <p className="text-gray-300 mt-1 mb-2">{username}</p>;
        break;

      case "date":
        output = <p className="text-gray-300 mt-1 mb-2">{new Date().toString()}</p>;
        break;
      
      case "echo":
        output = <p className="text-gray-300 mt-1 mb-2">{args.slice(1).join(" ")}</p>;
        break;

      case "gui":
      case "exit":
        output = <p className="text-yellow-400 mt-1 mb-2">Initiating transition to Graphical User Interface...</p>;
        setTimeout(() => router.push("/"), 800);
        break;

      case "sudo":
        output = <p className="text-red-500 mt-1 mb-2">User is not in the sudoers file. This incident will be reported to Syarif. 🚨</p>;
        break;

      case "clear":
        setHistory([]);
        return; 

      default:
        output = <p className="text-red-400 mt-1 mb-2">Command not found: {cmd}. Type 'help' for available commands.</p>;
    }

    setHistory((prev) => [...prev, { command: rawCmd, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (input.trim()) {
        const newCmdHistory = [...cmdHistory, input];
        setCmdHistory(newCmdHistory);
        setHistoryPointer(newCmdHistory.length);
      }
      processCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyPointer > 0) {
        const newPointer = historyPointer - 1;
        setHistoryPointer(newPointer);
        setInput(cmdHistory[newPointer]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer < cmdHistory.length - 1) {
        const newPointer = historyPointer + 1;
        setHistoryPointer(newPointer);
        setInput(cmdHistory[newPointer]);
      } else {
        setHistoryPointer(cmdHistory.length);
        setInput("");
      }
    } 
    // Fitur Tab Autocomplete
    else if (e.key === "Tab") {
      e.preventDefault(); 
      const availableCommands = ["help", "ls", "cat", "neofetch", "theme", "open", "history", "date", "clear", "gui", "sudo"];
      const match = availableCommands.find((cmd) => cmd.startsWith(input.toLowerCase()));
      if (match) {
        setInput(match);
      }
    }
  };

  return (
    <div 
      className={`min-h-screen bg-[#050505] ${themeClass} font-mono p-4 sm:p-8 cursor-text selection:bg-white selection:text-black overflow-x-hidden text-sm sm:text-base`}
      onClick={handleWrapperClick}
    >
      <div className="max-w-4xl mx-auto">
        {history.map((item, index) => (
          <div key={index}>
            {item.command !== "" && (
              <div className="flex gap-2">
                <span className="font-bold">@{username}</span>
                <span className="text-white">:</span>
                <span className="text-blue-400 font-bold">~/portfolio</span>
                <span className="text-white">$</span>
                <span className="text-gray-100">{item.command}</span>
              </div>
            )}
            <div>{item.output}</div>
          </div>
        ))}

        <div className="flex gap-2 items-center mt-1">
          <span className="font-bold">@{username}</span>
          <span className="text-white">:</span>
          <span className="text-blue-400 font-bold">~/portfolio</span>
          <span className="text-white">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`bg-transparent border-none outline-none text-gray-100 flex-1 py-1 caret-current`}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="none" 
          />
        </div>
        <div ref={bottomRef} className="pb-20" />
      </div>
    </div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
    role: "user" | "assistant";
    text: string;
}

// Renders basic markdown: **bold**, *italic*, bullet lines, newlines
function formatText(text: string): React.ReactNode[] {
    return text.split("\n").map((line, lineIdx) => {
        const isBullet = /^(\s*[-*]\s)/.test(line);
        const content = isBullet ? line.replace(/^\s*[-*]\s/, "") : line;

        const parts: React.ReactNode[] = [];
        const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
        let last = 0;
        let match;
        while ((match = regex.exec(content)) !== null) {
            if (match.index > last) parts.push(content.slice(last, match.index));
            if (match[1] !== undefined) parts.push(<strong key={match.index}>{match[1]}</strong>);
            else if (match[2] !== undefined) parts.push(<em key={match.index}>{match[2]}</em>);
            last = regex.lastIndex;
        }
        if (last < content.length) parts.push(content.slice(last));

        return isBullet ? (
            <div key={lineIdx} className="flex gap-1.5 items-start">
                <span className="mt-0.5 flex-shrink-0 text-green-400">•</span>
                <span>{parts}</span>
            </div>
        ) : (
            <div key={lineIdx} className={parts.length === 0 || content === "" ? "h-2" : ""}>
                {parts.length > 0 ? parts : null}
            </div>
        );
    });
}

export default function ChatBotInline() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<Message[]>([
        {
            role: "assistant",
            text: "Hi! I'm your YatraSathi Assistant 👋 Ask me about your bookings, ride status, fares, or anything else about your trips!",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const sendMessage = async () => {
        const trimmed = message.trim();
        if (!trimmed || loading) return;

        setChat((prev) => [...prev, { role: "user", text: trimmed }]);
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed }),
            });
            const data = await res.json();
            setChat((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: res.status === 401
                        ? "⚠️ Please log in to use the assistant."
                        : (data.reply || data.error || "No response received."),
                },
            ]);
        } catch {
            setChat((prev) => [
                ...prev,
                { role: "assistant", text: "❌ Could not reach the server. Please try again." },
            ]);
        }

        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-3 md:py-4 bg-gradient-to-r from-green-700/30 to-green-600/10 border-b border-white/5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center text-base md:text-lg flex-shrink-0">
                    🤖
                </div>
                <div>
                    <p className="text-xs md:text-sm font-bold text-white leading-tight">YatraSathi Assistant</p>
                    <p className="text-[10px] md:text-xs text-slate-400">Ask anything about your rides</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] md:text-xs text-green-400 font-medium whitespace-nowrap">Online</span>
                </div>
            </div>

            {/* Messages - div[2] in user XPath context */}
            <div className="h-56 sm:h-64 md:h-72 overflow-y-auto px-3 md:px-5 py-3 md:py-5 flex flex-col gap-2.5 md:gap-4 bg-slate-950/30">
                {chat.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[88%] md:max-w-[80%] px-3.5 md:px-5 py-2 md:py-3 text-xs md:text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-xl md:rounded-2xl rounded-br-sm whitespace-pre-wrap break-words shadow-sm"
                                : "bg-slate-800 text-slate-200 border border-white/5 rounded-xl md:rounded-2xl rounded-bl-sm shadow-sm"
                                }`}
                        >
                            {msg.role === "assistant" ? formatText(msg.text) : msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-white/5 rounded-xl md:rounded-2xl rounded-bl-sm px-3 md:px-4 py-2 md:py-3 flex gap-1.5 items-center">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-400"
                                    style={{ animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts - div[3] in user XPath context */}
            <div className="px-3 md:px-5 py-2 md:py-3.5 flex flex-wrap gap-2 border-t border-white/5 bg-slate-900/40">
                {["My upcoming rides", "Booking status", "Cancel policy"].map((prompt) => (
                    <button
                        key={prompt}
                        onClick={() => { setMessage(prompt); inputRef.current?.focus(); }}
                        className="text-[10px] md:text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            {/* Input - div[4] in user XPath context */}
            <div className="px-3 md:px-5 py-2.5 md:py-4 flex gap-2.5 items-center bg-slate-900/60 border-t border-white/5">
                <input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question…"
                    disabled={loading}
                    className="flex-1 bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 text-xs md:text-sm rounded-lg md:rounded-xl px-3.5 md:px-5 py-2 md:py-3 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all disabled:opacity-50"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                    aria-label="Send"
                >
                    <svg width="15" height="15" className="md:w-5 md:h-5" viewBox="0 0 24 24" fill="white">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>

            <style>{`
                @keyframes chatBounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30%           { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
}

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
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-700/30 to-green-600/10 border-b border-white/5">
                <div className="w-9 h-9 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center text-lg flex-shrink-0">
                    🤖
                </div>
                <div>
                    <p className="text-sm font-bold text-white leading-tight">YatraSathi Assistant</p>
                    <p className="text-xs text-slate-400">Ask anything about your rides</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-slate-950/30">
                {chat.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm whitespace-pre-wrap break-words"
                                    : "bg-slate-800 text-slate-200 border border-white/5 rounded-2xl rounded-bl-sm"
                                }`}
                        >
                            {msg.role === "assistant" ? formatText(msg.text) : msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                                    style={{ animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2 border-t border-white/5 bg-slate-900/40">
                {["My upcoming rides", "Booking status", "Cancel policy"].map((prompt) => (
                    <button
                        key={prompt}
                        onClick={() => { setMessage(prompt); inputRef.current?.focus(); }}
                        className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex gap-2 items-center bg-slate-900/40 border-t border-white/5">
                <input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question…"
                    disabled={loading}
                    className="flex-1 bg-slate-800 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all disabled:opacity-50"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="w-10 h-10 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
                    aria-label="Send"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
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

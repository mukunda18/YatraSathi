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

        // Parse inline bold/italic using regex
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
            <div key={lineIdx} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span style={{ marginTop: "2px", flexShrink: 0, color: "#16a34a" }}>•</span>
                <span>{parts}</span>
            </div>
        ) : (
            <div key={lineIdx} style={{ minHeight: parts.length === 0 || content === "" ? "8px" : undefined }}>
                {parts.length > 0 ? parts : null}
            </div>
        );
    });
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<Message[]>([
        {
            role: "assistant",
            text: "Hi! I'm your YatraSathi Assistant 👋 I can help you with your bookings, ride status, cancellations, and more. How can I help you today?",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            inputRef.current?.focus();
        }
    }, [chat, isOpen]);

    const sendMessage = async () => {
        const trimmed = message.trim();
        if (!trimmed || loading) return;

        const userMessage = trimmed;
        setChat((prev) => [...prev, { role: "user", text: userMessage }]);
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            if (res.status === 401) {
                setChat((prev) => [
                    ...prev,
                    { role: "assistant", text: "⚠️ Please log in to use the assistant." },
                ]);
            } else {
                setChat((prev) => [
                    ...prev,
                    { role: "assistant", text: data.reply || data.error || "No response received." },
                ]);
            }
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
        <>
            {/* Floating toggle button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Toggle YatraSathi Assistant"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 9999,
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "#16a34a",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(22,163,74,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 25px rgba(22,163,74,0.55)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(22,163,74,0.45)";
                }}
            >
                {isOpen ? (
                    // X icon
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    // Chat bubble icon
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                )}
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "92px",
                        right: "24px",
                        zIndex: 9998,
                        width: "360px",
                        maxWidth: "calc(100vw - 48px)",
                        height: "500px",
                        maxHeight: "calc(100vh - 120px)",
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        border: "1px solid #e5e7eb",
                        animation: "chatSlideIn 0.2s ease",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #16a34a, #15803d)",
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                flexShrink: 0,
                            }}
                        >
                            🤖
                        </div>
                        <div>
                            <div style={{ color: "white", fontWeight: 700, fontSize: "15px", lineHeight: 1.2 }}>
                                YatraSathi Assistant
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>
                                Your personal ride helper
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "16px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            backgroundColor: "#f9fafb",
                        }}
                    >
                        {chat.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "82%",
                                        padding: "10px 13px",
                                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                        backgroundColor: msg.role === "user" ? "#2563eb" : "#ffffff",
                                        color: msg.role === "user" ? "#ffffff" : "#111827",
                                        fontSize: "13.5px",
                                        lineHeight: "1.5",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        border: msg.role === "assistant" ? "1px solid #e5e7eb" : "none",
                                    }}
                                >
                                    {msg.role === "assistant" ? formatText(msg.text) : msg.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: "18px 18px 18px 4px",
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                        display: "flex",
                                        gap: "4px",
                                        alignItems: "center",
                                    }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: "7px",
                                                height: "7px",
                                                borderRadius: "50%",
                                                backgroundColor: "#9ca3af",
                                                animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div
                        style={{
                            padding: "12px 14px",
                            borderTop: "1px solid #e5e7eb",
                            backgroundColor: "#ffffff",
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexShrink: 0,
                        }}
                    >
                        <input
                            ref={inputRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your bookings, rides..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                border: "1.5px solid #d1d5db",
                                borderRadius: "20px",
                                padding: "9px 14px",
                                fontSize: "13.5px",
                                outline: "none",
                                transition: "border-color 0.15s",
                                backgroundColor: loading ? "#f3f4f6" : "#ffffff",
                                color: "#111827",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !message.trim()}
                            aria-label="Send message"
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                backgroundColor: loading || !message.trim() ? "#d1d5db" : "#16a34a",
                                border: "none",
                                cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                transition: "background-color 0.15s",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes chatSlideIn {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes chatBounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30%           { transform: translateY(-5px); }
                }
            `}</style>
        </>
    );
}

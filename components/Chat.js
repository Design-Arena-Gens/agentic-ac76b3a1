"use client";

import { useEffect, useRef, useState } from "react";

function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`row ${isUser ? "right" : "left"}`}>
      <div className={`bubble ${isUser ? "user" : "assistant"}`}>
        {content}
      </div>
      <style jsx>{`
        .row { display: flex; margin: 10px 0; }
        .left { justify-content: flex-start; }
        .right { justify-content: flex-end; }
        .bubble {
          max-width: 75%;
          padding: 12px 14px;
          border-radius: 14px;
          line-height: 1.45;
          white-space: pre-wrap;
          word-wrap: break-word;
          border: 1px solid var(--border);
        }
        .assistant {
          background: linear-gradient(180deg, #111826, #0e1422);
          color: var(--text);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .user {
          background: linear-gradient(180deg, rgba(106,166,255,0.18), rgba(106,166,255,0.1));
          color: var(--text);
          border-color: rgba(106,166,255,0.35);
        }
      `}</style>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I?m your AI assistant. How can I help today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(e) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.message?.content || "(No response)";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(m => [
        ...m,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <div ref={viewportRef} className="viewport">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="typing">
            <span className="dot"/><span className="dot"/><span className="dot"/>
          </div>
        )}
      </div>

      <form className="inputbar" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
          aria-label="Chat input"
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? "..." : "Send"}
        </button>
      </form>

      <style jsx>{`
        .wrap { display: grid; grid-template-rows: 1fr auto; height: calc(100vh - 110px); }
        .viewport {
          overflow-y: auto; padding: 16px; scroll-behavior: smooth;
        }
        .inputbar {
          display: grid; grid-template-columns: 1fr auto; gap: 10px;
          padding: 12px 16px; border-top: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
          position: sticky; bottom: 0;
        }
        input {
          background: #0e1422; color: var(--text);
          border: 1px solid var(--border); outline: none; border-radius: 12px;
          padding: 12px 14px; font-size: 14px;
        }
        input::placeholder { color: var(--muted); }
        button {
          background: linear-gradient(135deg, #6aa6ff, #7c8cff);
          color: white; border: none; border-radius: 12px; padding: 0 16px;
          font-weight: 600; cursor: pointer;
          box-shadow: 0 8px 20px rgba(106,166,255,0.35);
        }
        button[disabled] { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
        .typing { display: flex; gap: 6px; padding: 8px 2px 14px 2px; color: var(--muted); }
        .dot { width: 6px; height: 6px; background: var(--muted); border-radius: 999px; animation: updown 1s infinite; }
        .dot:nth-child(2){ animation-delay: 0.16s; }
        .dot:nth-child(3){ animation-delay: 0.32s; }
        @keyframes updown { 0%, 80%, 100% { transform: translateY(0); opacity: .6;} 40% { transform: translateY(-4px); opacity: 1; } }
      `}</style>
    </div>
  );
}

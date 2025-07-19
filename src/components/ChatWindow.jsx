import { useState, useRef, useEffect, useCallback } from "react";
import { FiSend } from "react-icons/fi";
import { sendMessage } from "../api/chat";

// (Optional) avatar URLs or placeholders
const AVATAR_BOT  = "https://ui-avatars.com/api/?name=AI&background=8b5cf6&color=fff";
const AVATAR_USER = "https://ui-avatars.com/api/?name=You&background=2563eb&color=fff";

export default function ChatWindow() {
  const [messages, setMessages] = useState(() => {
    // Restore from localStorage if available
    try {
      const saved = localStorage.getItem("chat_messages");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: Date.now(),
        sender: "bot",
        text: "Hi! It’s nice to meet you. How can I help you today?"
      }
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSend = async () => {
    if (loading) return;                  // Prevent spam
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now() + "-u",
      sender: "user",
      text: input.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await sendMessage(userMsg.text);
      const botMsg = {
        id: Date.now() + "-b",
        sender: "bot",
        text: aiReply || "⚠️ No response."
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + "-e",
            sender: "bot",
          text: "⚠️ Error contacting AI. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // allow newline
        return;
      }
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="
        flex flex-col h-[calc(100vh-64px)]
        bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
        px-4 pb-4
      "
    >
      {/* Inner chat container (glass) */}
      <div className="
        flex flex-col flex-1
        backdrop-blur-md bg-white/15 border border-white/25
        shadow-xl rounded-2xl overflow-hidden
      ">
        {/* Messages Scroll Area */}
        <div className="
          flex-1 overflow-y-auto p-4 space-y-4
          scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent
        ">
          {messages.map(msg => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}

          {loading && (
            <ChatBubble
              msg={{
                id: "typing",
                sender: "bot",
                text: "Typing..."
              }}
              typing
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/20 bg-white/10 backdrop-blur-xl p-3">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message (Shift+Enter for newline)…"
              className="
                flex-1 resize-none px-4 py-2 rounded-xl
                bg-white/20 text-white placeholder-white/60
                focus:outline-none focus:ring-2 focus:ring-white/50
                scrollbar-thin scrollbar-thumb-white/30
              "
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className={`
                flex items-center justify-center
                w-12 h-12 rounded-xl
                transition font-semibold
                ${loading || !input.trim()
                  ? "bg-white/20 text-white/50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow"}
              `}
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Chat Bubble Component --- */
function ChatBubble({ msg, typing = false }) {
  const isUser = msg.sender === "user";
  const avatar = isUser ? AVATAR_USER : AVATAR_BOT;

  return (
    <div
      className={`flex items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <img
          src={avatar}
          alt="AI"
          className="w-8 h-8 rounded-full border border-white/30 shadow"
        />
      )}
      <div
        className={`
          px-4 py-2 rounded-2xl max-w-[75%] md:max-w-[60%] lg:max-w-[50%]
          text-sm leading-relaxed shadow
          ${isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white/80 text-gray-900 rounded-bl-none backdrop-blur-sm"
          }
        `}
      >
        {typing ? (
          <span className="flex gap-1">
            <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
          </span>
        ) : (
          msg.text
        )}
      </div>
      {isUser && (
        <img
          src={avatar}
          alt="You"
          className="w-8 h-8 rounded-full border border-white/30 shadow"
        />
      )}
    </div>
  );
}

/* --- Animated typing dots --- */
function Dot({ delay = "0ms" }) {
  return (
    <span
      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}

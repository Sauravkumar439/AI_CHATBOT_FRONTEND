import { useState, useRef, useEffect, useCallback } from "react";
import { FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessage } from "../api/chat";

/* ---- Avatar Sources ---- */
const AI_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"; // AI avatar icon
const FALLBACK_USER = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

/* ---- Typing Indicator (AI) ---- */
const TypingDots = () => (
  <div className="flex items-center gap-1">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    <span
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "120ms" }}
    />
    <span
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "240ms" }}
    />
  </div>
);

/* Utility to make a reasonably unique ID */
const uid = (suffix = "") =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${suffix}`;

export default function Chat() {
  // Load user (if logged in) to get avatar
  const userObj = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const userAvatar = userObj?.avatar?.trim()
    ? userObj.avatar
    : FALLBACK_USER(userObj?.name || "You");

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      avatar: AI_AVATAR,
      text: "Hi! It’s nice to meet you. How can I help you today?",
      createdAt: Date.now()
    }
  ]);

  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const userTypingTimeoutRef = useRef(null);

  /* ---- Scroll to bottom whenever messages or typing status changes ---- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTyping, scrollToBottom]);

  /* ---- User typing detection (for avatar pulse) ---- */
  useEffect(() => {
    if (input.trim()) {
      if (!userTyping) setUserTyping(true);
      if (userTypingTimeoutRef.current) clearTimeout(userTypingTimeoutRef.current);
      userTypingTimeoutRef.current = setTimeout(() => {
        setUserTyping(false);
      }, 1800); // stop pulsing 1.8s after last keypress
    } else {
      setUserTyping(false);
    }
    return () => clearTimeout(userTypingTimeoutRef.current);
  }, [input, userTyping]);

  /* ---- Send message ---- */
  const handleSend = async () => {
    if (!input.trim() || aiTyping) return;

    const content = input.trim();
    setInput("");

    const userMsg = {
      id: uid("-u"),
      sender: "user",
      avatar: userAvatar,
      text: content,
      createdAt: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setAiTyping(true);

    try {
      const aiReply = await sendMessage(content);
      const botMsg = {
        id: uid("-b"),
        sender: "ai",
        avatar: AI_AVATAR,
        text: aiReply || "⚠️ I didn’t get a response. Please try again.",
        createdAt: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: uid("-err"),
          sender: "ai",
          avatar: AI_AVATAR,
          text: "⚠️ Error contacting the AI service. Please retry.",
          createdAt: Date.now()
        }
      ]);
    } finally {
      setAiTyping(false);
      setUserTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return; // (Future: multi-line textarea)
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 shadow-lg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white/10 backdrop-blur-lg p-4 shadow-md space-y-4 rounded-xl scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <motion.img
                    src={msg.avatar}
                    alt="AI"
                    className="w-10 h-10 rounded-full border border-white/30 shadow-md object-cover"
                    whileHover={{ rotate: 4 }}
                    draggable={false}
                  />
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[70%] md:max-w-[55%] lg:max-w-[45%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow group relative
                    ${
                      isUser
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                >
                  {msg.text}
                  <div
                    className={`text-[10px] mt-1 opacity-60 ${
                      isUser ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <motion.img
                    src={msg.avatar}
                    alt="You"
                    className="w-10 h-10 rounded-full border border-white/30 shadow-md object-cover"
                    whileHover={{ rotate: -4 }}
                    animate={
                      // subtle pulse only while *current* input is non-empty (user typing)
                      userTyping
                        ? {
                            scale: [1, 1.08, 1],
                            transition: {
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          }
                        : {}
                    }
                    draggable={false}
                  />
                )}
              </motion.div>
            );
          })}

          {/* AI Typing Indicator */}
          {aiTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-end gap-2 justify-start"
            >
              <motion.img
                src={AI_AVATAR}
                alt="AI typing"
                className="w-10 h-10 rounded-full border border-white/30 shadow-md object-cover"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 rounded-bl-none shadow text-sm">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Optional “You are typing…” small helper (shows only if userTyping & no AI typing) */}
      {userTyping && !aiTyping && (
        <div className="mt-1 text-xs text-white/70 pl-1 select-none">
          You’re typing…
        </div>
      )}

      {/* Input Box */}
      <div className="mt-3 flex items-center bg-white/20 backdrop-blur-md p-2 shadow-md rounded-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent focus:outline-none text-white placeholder-white/70 px-2"
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || aiTyping}
          className={`p-3 rounded-xl transition flex items-center justify-center ${
            !input.trim() || aiTyping
              ? "bg-white/30 text-white/50 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"
          }`}
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}

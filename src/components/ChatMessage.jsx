export default function ChatMessage({ sender, message }) {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow-md break-words
        ${isUser 
          ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-none" 
          : "bg-gray-200 text-gray-800 rounded-bl-none"}`}
      >
        {message}
      </div>
    </div>
  );
}

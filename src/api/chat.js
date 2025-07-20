import axios from "axios";

// Automatically switch between local and production
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ai-chatbot-backend-owxc.onrender.com/api";

const chatAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // 20 seconds timeout
});

// Send message to backend
export const sendMessage = async (message) => {
  try {
    const response = await chatAPI.post("/chat", { message });
    return response.data.reply;
  } catch (error) {
    console.error("Chat API Error:", error.response?.data || error.message);
    if (error.code === "ECONNABORTED") {
      return "⚠️ Request timed out. Try again.";
    }
    return "⚠️ Unable to get AI response. Check server or network.";
  }
};

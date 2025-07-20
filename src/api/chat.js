import axios from "axios";

// Automatically switch between local and production
const BASE_URL =
<<<<<<< HEAD
  import.meta.env.PROD
    ? "https://ai-chatbot-backend-owxc.onrender.com/api"
    : "http://localhost:5000/api";
=======
  process.env.NODE_ENV === "production"
    ? "https://ai-chatbot-backend-owxc.onrender.com/api":
>>>>>>> 560ee06e4bf566e88b3039bd04de9a1a6d8a9202

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
    console.error("Chat API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    });

    if (error.code === "ECONNABORTED") {
      return "⚠️ Request timed out. Try again.";
    }
    return "⚠️ Unable to get AI response. Check server or network.";
  }
};

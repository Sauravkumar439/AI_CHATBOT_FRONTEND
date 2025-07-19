import { Link } from "react-router-dom";

export default function Landing({ isLoggedIn }) {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 text-white">
      <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
        Welcome to AI Chatbot
      </h1>
      <p className="text-lg text-white/80 mb-8 max-w-lg px-4">
        Sign up or log in to start chatting with our intelligent AI assistant!
      </p>
      {isLoggedIn ? (
        <Link
          to="/chat"
          className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg"
        >
          Go to Chat
        </Link>
      ) : (
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-white text-green-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Signup
          </Link>
        </div>
      )}
    </div>
  );
}

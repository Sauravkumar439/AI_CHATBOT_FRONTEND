import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const avatarUrl = user
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`
    : "https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff";

  return (
    <nav className="bg-white fixed top-0 left-0 right-0 z-50 shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-purple-600 font-bold text-lg">
        AI Chatbot
      </Link>

      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            <Link to="/chat" className="text-gray-600 hover:text-purple-600">
              Chat
            </Link>

            {/* Avatar Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img
                src={avatarUrl}
                alt={user?.name || "User"}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-purple-500 transition-transform duration-200 hover:scale-105"
              />

              {isHovered && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fadeIn">
                  <p className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {user?.name || "Guest"}
                  </p>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-purple-600">
              Login
            </Link>
            <Link to="/signup" className="text-gray-600 hover:text-purple-600">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

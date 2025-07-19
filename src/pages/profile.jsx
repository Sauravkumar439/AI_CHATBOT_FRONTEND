import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Profile({ setIsLoggedIn }) {
  const navigate = useNavigate();

  // Prevent toast spam on initial auto-load
  const initialLoadRef = useRef(true);

  // Initial state from cache to avoid flicker
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const normalizeUser = (data) => {
    if (!data) return null;
    if (data.user) {
      return {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar || ""
      };
    }
    return {
      id: data.id || data._id,
      name: data.name,
      email: data.email,
      avatar: data.avatar || ""
    };
  };

  const loadProfile = useCallback(
    async (manual = false) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setError("");
      setFetching(true);

      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const normalized = normalizeUser(res.data);
        if (!normalized || !normalized.name) {
          throw new Error("Malformed /me response");
        }

        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));

        if (manual) {
          toast.success("Profile refreshed");
        }
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err.response?.data || err.message);

        // Show toast only on manual attempts or after initial mount completes
        if (manual) {
          toast.error("Failed to refresh profile");
        } else if (!initialLoadRef.current) {
          toast.error("Session expired. Please log in again.");
        }

        setError("Could not load profile. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigate("/login");
      } finally {
        setFetching(false);
        setLoading(false);
        initialLoadRef.current = false;
      }
    },
    [API_BASE, navigate, setIsLoggedIn]
  );

  useEffect(() => {
    loadProfile(false); // initial load
  }, [loadProfile]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    toast.success("Logged out");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 text-white text-lg">
        Loading profile...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="fixed inset-0 flex flex-col gap-4 justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 text-white px-4">
        <p className="text-center text-red-200">{error}</p>
        <button
          onClick={() => navigate("/login")}
            className="bg-white text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const avatarSrc =
    user?.avatar && user.avatar.trim() !== ""
      ? user.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.name || "User"
        )}&background=8b5cf6&color=fff`;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 text-center text-white relative">
        {/* Refresh Button */}
        <button
          onClick={() => loadProfile(true)}
          disabled={fetching}
          className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition focus:outline-none focus:ring-2 focus:ring-white/50 ${
            fetching ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {fetching ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
              …
            </span>
          ) : (
            "Refresh"
          )}
        </button>

        {/* Avatar */}
        <img
          src={avatarSrc}
          alt={user?.name || "User Avatar"}
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 shadow-lg object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.name || "User"
            )}&background=8b5cf6&color=fff`;
          }}
        />

        {/* User Info */}
        <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
        <p className="text-white/80 mb-6">{user?.email}</p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="bg-blue-500 hover:bg-blue-600 transition px-5 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Go to Chat
          </button>
          <button
            onClick={() => navigate("/edit-profile")}
            className="bg-white/20 hover:bg-white/30 transition px-5 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate("/change-password")}
            className="bg-yellow-500 hover:bg-yellow-600 transition px-5 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition px-5 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Logout
          </button>
        </div>

        {error && user && (
          <p className="mt-4 text-xs text-red-200">(Warning) {error}</p>
        )}
      </div>
    </div>
  );
}

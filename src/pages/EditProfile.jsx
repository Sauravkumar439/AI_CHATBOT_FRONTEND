import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditProfile({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [initialAvatar, setInitialAvatar] = useState("");

  const [loading, setLoading] = useState(true);     // full page load
  const [saving, setSaving] = useState(false);      // form submit
  const [fetchError, setFetchError] = useState("");

  const token = localStorage.getItem("token");

  const fetchUser = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setFetchError("");
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Accept both { user: {...} } or flat
      const user = res.data.user
        ? res.data.user
        : {
            name: res.data.name,
            email: res.data.email,
            avatar: res.data.avatar
          };

      setName(user.name || "");
      setAvatar(user.avatar || "");
      setInitialAvatar(user.avatar || "");
    } catch (err) {
      console.error("EDIT PROFILE FETCH ERROR:", err.response?.data || err.message);
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token, navigate, setIsLoggedIn]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const validName = name.trim().length >= 2;
  const avatarProvided = avatar.trim() !== "";
  const validAvatar = !avatarProvided || /^https?:\/\//i.test(avatar.trim());
  const formChanged = name.trim() !== "" && (avatar !== initialAvatar || name.trim() !== name);
  const canSubmit = !saving && validName && validAvatar;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!token) {
      toast.error("Not authenticated");
      return navigate("/login");
    }

    if (!validName) {
      toast.error("Name must be at least 2 characters.");
      return;
    }
    if (!validAvatar) {
      toast.error("Avatar URL must start with http:// or https://");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(
        `${API_BASE}/auth/profile`,
        { name: name.trim(), avatar: avatar.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      toast.success("Profile updated!");
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 text-white text-lg">
        Loading...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="fixed inset-0 flex flex-col gap-4 justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 text-white px-4">
        <p className="text-center text-red-200">{fetchError}</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const previewAvatar =
    avatarProvided && validAvatar
      ? avatar.trim()
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name || "User"
        )}&background=8b5cf6&color=fff`;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 p-4">
      <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={previewAvatar}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg mb-3"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name || "User"
              )}&background=8b5cf6&color=fff`;
            }}
          />
          <p className="text-xs text-white/60">
            {avatarProvided
              ? validAvatar
                ? "Using custom avatar"
                : "Invalid URL — fallback used"
              : "Auto-generated avatar"}
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col space-y-5">
          {/* Name */}
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="edit-name"
              className="text-xs uppercase tracking-wide text-white/70 font-semibold"
            >
              Full Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={`p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 ${
                validName
                  ? "focus:ring-emerald-300"
                  : "focus:ring-red-300"
              } border border-white/10`}
              autoComplete="name"
            />
            {!validName && (
              <span className="text-xs text-red-200">
                Name must be at least 2 characters.
              </span>
            )}
          </div>

            {/* Avatar URL */}
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="edit-avatar"
              className="text-xs uppercase tracking-wide text-white/70 font-semibold"
            >
              Avatar URL (Optional)
            </label>
            <input
              id="edit-avatar"
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className={`p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 ${
                !avatarProvided || validAvatar
                  ? "focus:ring-white/70"
                  : "focus:ring-red-300"
              } border border-white/10`}
              autoComplete="off"
            />
            {avatarProvided && !validAvatar && (
              <span className="text-xs text-yellow-200">
                Must start with http:// or https://
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 p-3 rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600
                ${
                  !canSubmit
                    ? "bg-white/30 text-white/60 cursor-not-allowed"
                    : "bg-white text-purple-700 hover:bg-gray-100"
                }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-3 rounded-lg font-semibold bg-white/20 hover:bg-white/30 transition focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-5 py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

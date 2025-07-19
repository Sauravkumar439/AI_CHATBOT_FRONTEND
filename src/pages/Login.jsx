import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import toast from "react-hot-toast";

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Validators
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const formValid = isEmailValid && isPasswordValid;

  // Auto-focus email on mount
  useEffect(() => {
    const el = document.getElementById("login-email");
    el && el.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formValid || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await loginUser(email.trim(), password);
      // Save token + user
      localStorage.setItem("token", res.token);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      if (!remember) {
        sessionStorage.setItem("token", res.token);
        sessionStorage.setItem("user", JSON.stringify(res.user));
      }
      setIsLoggedIn(true);
      toast.success(`Welcome back, ${res.user?.name || "User"}!`);
      navigate("/chat");
    } catch (err) {
      const msg = err.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 px-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Login
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/30 border border-red-400/40 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
          {/* Email */}
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="login-email"
              className="text-xs uppercase tracking-wide text-white/70 font-semibold"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@example.com"
              className={`p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 ${
                isEmailValid
                  ? "focus:ring-emerald-300"
                  : touched.email
                  ? "focus:ring-red-300"
                  : "focus:ring-white/70"
              } border border-white/10`}
              autoComplete="email"
            />
            {!isEmailValid && touched.email && (
              <span className="text-xs text-red-200">
                Enter a valid email address.
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="login-password"
              className="text-xs uppercase tracking-wide text-white/70 font-semibold"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                className={`w-full p-3 pr-12 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 ${
                  isPasswordValid
                    ? "focus:ring-emerald-300"
                    : touched.password
                    ? "focus:ring-red-300"
                    : "focus:ring-white/70"
                } border border-white/10`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-xs px-2 py-1 rounded-md bg-white/20 text-white hover:bg-white/30 transition"
                tabIndex={-1}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
            {!isPasswordValid && touched.password && (
              <span className="text-xs text-red-200">
                Password must be at least 6 characters.
              </span>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-white/80 text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-purple-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="hover:underline text-white/70"
              onClick={() =>
                toast("Forgot password flow not implemented yet.", {
                  icon: "ℹ️",
                })
              }
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!formValid || loading}
            className={`p-3 rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-600
              ${
                !formValid || loading
                  ? "bg-white/30 text-white/60 cursor-not-allowed"
                  : "bg-white text-purple-700 hover:bg-gray-100"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-white text-center mt-6 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-yellow-300 underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

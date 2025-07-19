import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, Suspense } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import { Toaster } from "react-hot-toast";          // <-- Toast provider
import toast from "react-hot-toast";                 // <-- For optional global toasts

// ---- Protected Route Wrapper ----
function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  // Check auth token
  const checkToken = useCallback(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // On mount
  useEffect(() => {
    checkToken();
    setFirstLoad(false);
  }, [checkToken]);

  // Sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "token") {
        const before = isLoggedIn;
        checkToken();
        // Optional global toast on cross‑tab change:
        const now = !!localStorage.getItem("token");
        if (before && !now) toast("Logged out in another tab", { icon: "ℹ️" });
        if (!before && now) toast.success("Logged in (another tab)");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [checkToken, isLoggedIn]);

  // Scroll reset (except chat)
  useEffect(() => {
    if (location.pathname !== "/chat") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  // Hide navbar on auth pages
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);

  const containerClasses = [
    "flex-1",
    location.pathname === "/chat" ? "p-0" : "p-4",
    !hideNavbar ? "pt-20" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="h-screen flex flex-col">
      {/* Global toast portal (remove if already in main.jsx) */}
      <Toaster position="top-right" reverseOrder={false} />

      {!hideNavbar && (
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}

      <div className={containerClasses}>
        <Suspense fallback={<div className="text-center p-6">Loading…</div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing isLoggedIn={isLoggedIn} />} />
            <Route
              path="/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route
              path="/signup"
              element={<Signup setIsLoggedIn={setIsLoggedIn} />}
            />

            {/* Protected */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Profile setIsLoggedIn={setIsLoggedIn} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <EditProfile setIsLoggedIn={setIsLoggedIn} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

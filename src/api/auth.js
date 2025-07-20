import axios from "axios";

/* =========================================================
   Base URL (works locally & after deployment)
========================================================= */
const AUTH_BASE =
<<<<<<< HEAD
  import.meta.env.PROD
    ? "https://ai-chatbot-backend-owxc.onrender.com/api/auth"
    : "http://localhost:5000/api/auth";
=======
  process.env.NODE_ENV === "production"
    ? "https://ai-chatbot-backend-owxc.onrender.com/api/auth":
>>>>>>> 560ee06e4bf566e88b3039bd04de9a1a6d8a9202

/* =========================================================
   Helpers
========================================================= */

// Build auth headers with token
function authHeaders() {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// Normalize error
function normalizeError(error, fallback = "Request failed") {
  const msg = error?.response?.data?.message || error?.message || fallback;
  return new Error(msg);
}

// Wrapper for authorized requests
async function authRequest(method, url, data) {
  try {
    const res = await axios({
      method,
      url: `${AUTH_BASE}${url}`,
      data,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      }
    });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// Persist auth data
function persistAuth(data, { remember, autoStore }) {
  if (!autoStore || !data?.token) return;
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", data.token);
  if (data.user) storage.setItem("user", JSON.stringify(data.user));
}

/* =========================================================
   Auth APIs
========================================================= */

// Login
export async function loginUser(email, password, options = {}) {
  const { remember = true, autoStore = true } = options;
  try {
    const res = await axios.post(`${AUTH_BASE}/login`, { email, password });
    persistAuth(res.data, { remember, autoStore });
    return res.data;
  } catch (err) {
    throw normalizeError(err, "Login failed");
  }
}

// Signup
export async function signupUser(name, email, password, avatar = "", options = {}) {
  const { remember = true, autoStore = true } = options;
  try {
    const res = await axios.post(`${AUTH_BASE}/register`, {
      name,
      email,
      password,
      avatar
    });
    persistAuth(res.data, { remember, autoStore });
    return res.data;
  } catch (err) {
    throw normalizeError(err, "Signup failed");
  }
}

// Get current user
export async function getMe({ syncLocal = true } = {}) {
  const data = await authRequest("get", "/me");
  const userObj = data.user || {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar
  };
  if (syncLocal && userObj?.name) {
    try {
      const storage =
        localStorage.getItem("token") ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(userObj));
    } catch {}
  }
  return userObj;
}

// Update profile
export async function updateProfile(payload) {
  const data = await authRequest("put", "/profile", payload);
  if (data?.user) {
    try {
      const storage =
        localStorage.getItem("token") ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(data.user));
    } catch {}
  }
  return data;
}

// Change password
export async function changePassword(oldPassword, newPassword) {
  return await authRequest("put", "/password", { oldPassword, newPassword });
}

// Validate token
export async function validateToken() {
  return await authRequest("get", "/validate");
}

// Logout utility
export function clearAuth() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  } catch {}
}

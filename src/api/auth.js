// src/api/auth.js
import axios from "axios";

/* =========================================================
   Base URL (works locally & after deployment)
   In production assume backend is reverse proxied at /api
========================================================= */
const AUTH_BASE =
  process.env.NODE_ENV === "production"
    ? `${window.location.origin}/api/auth`
    : "http://localhost:5000/api/auth";

/* =========================================================
   Helpers
========================================================= */

// Build auth headers with token (from localStorage first, fallback sessionStorage)
function authHeaders() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// Generic error normalizer
function normalizeError(error, fallback = "Request failed") {
  const msg =
    error?.response?.data?.message ||
    error?.message ||
    fallback;
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

/* =========================================================
   Auth APIs
========================================================= */

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @param {object} options { remember: boolean (default true), autoStore: boolean (default true) }
 */
export async function loginUser(email, password, options = {}) {
  const { remember = true, autoStore = true } = options;
  try {
    const res = await axios.post(`${AUTH_BASE}/login`, { email, password });
    // Expected shape: { success, message, token, user: { id, name, email, avatar } }
    if (autoStore && res.data?.token) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      if (res.data.user) {
        storage.setItem("user", JSON.stringify(res.data.user));
      }
    }
    return res.data;
  } catch (err) {
    throw normalizeError(err, "Login failed");
  }
}

/**
 * Signup user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string} avatar (optional)
 * @param {object} options { remember: boolean, autoStore: boolean }
 */
export async function signupUser(
  name,
  email,
  password,
  avatar = "",
  options = {}
) {
  const { remember = true, autoStore = true } = options;
  try {
    const res = await axios.post(`${AUTH_BASE}/register`, {
      name,
      email,
      password,
      avatar
    });
    if (autoStore && res.data?.token) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      if (res.data.user) {
        storage.setItem("user", JSON.stringify(res.data.user));
      }
    }
    return res.data;
  } catch (err) {
    throw normalizeError(err, "Signup failed");
  }
}

/**
 * Get current user (/me)
 * Syncs local cache if successful
 */
export async function getMe({ syncLocal = true } = {}) {
  const data = await authRequest("get", "/me");
  // Backend returns both flat + user object. Prefer data.user if present.
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

/**
 * Update profile (name, avatar)
 * @param {object} payload { name?, avatar? }
 */
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

/**
 * Change password
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export async function changePassword(oldPassword, newPassword) {
  return await authRequest("put", "/password", { oldPassword, newPassword });
}

/**
 * Validate token (optional utility)
 */
export async function validateToken() {
  return await authRequest("get", "/validate");
}

/* =========================================================
   Utility for manual logout
========================================================= */
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

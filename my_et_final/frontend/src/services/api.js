/**
 * API Service Layer
 * Handles all communication with the FastAPI backend
 * Falls back to demo data when backend is unavailable
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─── User ──────────────────────────────────────────────────────────────────

export const createUserProfile = async (profile) => {
  try {
    const { data } = await api.post("/api/users/profile", profile);
    return data;
  } catch (e) {
    console.warn("[API] Backend unavailable, using demo mode");
    return { success: true, avatar: {} };
  }
};

export const getUserDashboard = async (userId) => {
  try {
    const { data } = await api.get(`/api/users/${userId}/dashboard`);
    return data;
  } catch (e) {
    return null; // Fall back to demo data in component
  }
};

// ─── News ──────────────────────────────────────────────────────────────────

export const getNewsFeed = async (role = "investor", page = 1) => {
  try {
    const { data } = await api.get(`/api/news/feed`, { params: { role, page } });
    return data.articles;
  } catch (e) {
    return null;
  }
};

export const getBreakingNews = async () => {
  try {
    const { data } = await api.get("/api/news/breaking");
    return data;
  } catch (e) {
    return [];
  }
};

export const getTrendingTopics = async () => {
  try {
    const { data } = await api.get("/api/news/trending");
    return data;
  } catch (e) {
    return [];
  }
};

export const getStoryTimeline = async (articleId) => {
  try {
    const { data } = await api.get(`/api/news/${articleId}/timeline`);
    return data;
  } catch (e) {
    return null;
  }
};

// ─── Chat ──────────────────────────────────────────────────────────────────

export const sendChatMessage = async (userId, message, sessionId = null) => {
  try {
    const { data } = await api.post("/api/chat", {
      user_id: userId,
      message,
      session_id: sessionId,
    });
    return data;
  } catch (e) {
    return null; // Component will use demo response
  }
};

// ─── Behavior Tracking ─────────────────────────────────────────────────────

export const trackBehavior = async (userId, action, entity, metadata = {}) => {
  try {
    await api.post("/api/behavior/track", {
      user_id: userId,
      action,
      entity,
      metadata,
    });
  } catch (e) {
    // Silent fail — tracking is non-critical
  }
};

// ─── Notifications ─────────────────────────────────────────────────────────

export const getNotifications = async (userId) => {
  try {
    const { data } = await api.get(`/api/notifications/${userId}`);
    return data.alerts;
  } catch (e) {
    return [];
  }
};

export const dismissNotification = async (userId, alertId) => {
  try {
    await api.post(`/api/notifications/${alertId}/dismiss`, null, {
      params: { user_id: userId },
    });
  } catch (e) {
    // Silent fail
  }
};

// ─── Avatar ────────────────────────────────────────────────────────────────

export const getAvatarGreeting = async (userId) => {
  try {
    const { data } = await api.get(`/api/avatar/${userId}/greeting`);
    return data;
  } catch (e) {
    return null;
  }
};

// ─── Translation ───────────────────────────────────────────────────────────

export const translateContent = async (text, targetLang, userId) => {
  try {
    const { data } = await api.post("/api/translate", null, {
      params: { text, target_lang: targetLang, user_id: userId },
    });
    return data.translated;
  } catch (e) {
    return text; // Return original on failure
  }
};

export default api;

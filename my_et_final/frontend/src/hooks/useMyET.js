/**
 * Custom React hooks for My ET
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "../services/api";

// ─── useNewsFeed ────────────────────────────────────────────────────────────

export function useNewsFeed(role) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getNewsFeed(role).then((data) => {
      if (!cancelled && data) setArticles(data);
    }).catch((e) => {
      if (!cancelled) setError(e.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [role]);

  return { articles, loading, error };
}

// ─── useBreakingNews ────────────────────────────────────────────────────────

export function useBreakingNews(role) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.getBreakingNews().then((data) => {
      if (data) setAlerts(data.filter((a) => a.affected_roles?.includes(role)));
    });
  }, [role]);

  return alerts;
}

// ─── useChat ────────────────────────────────────────────────────────────────

export function useChat(userId, role) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const sendMessage = useCallback(async (text) => {
    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.sendChatMessage(userId, text, sessionId);
      if (response) {
        setSessionId(response.session_id);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: response.response },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId]);

  return { messages, loading, sendMessage };
}

// ─── useNotifications ───────────────────────────────────────────────────────

export function useNotifications(userId, role) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.getNotifications(userId).then((data) => {
      if (data?.length) setNotifications(data);
    });

    // Poll every 30 seconds
    const interval = setInterval(() => {
      api.getNotifications(userId).then((data) => {
        if (data?.length) setNotifications(data);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const dismiss = useCallback((alertId) => {
    api.dismissNotification(userId, alertId);
    setNotifications((prev) => prev.filter((n) => n.id !== alertId));
  }, [userId]);

  return { notifications, dismiss };
}

// ─── useBehaviorTracking ────────────────────────────────────────────────────

export function useBehaviorTracking(userId) {
  const track = useCallback((action, entity, metadata = {}) => {
    api.trackBehavior(userId, action, entity, metadata);
  }, [userId]);

  return { track };
}

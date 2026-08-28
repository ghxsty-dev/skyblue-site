"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/lib/context";
import { MessageIcon, StarIcon } from "@/lib/icons";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isStaff: boolean;
  avatar?: string;
}

type View = "username" | "chat" | "review" | "thanks";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let saved = localStorage.getItem("skyblue-chat-session");
  if (!saved) {
    saved = `sb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("skyblue-chat-session", saved);
  }
  return saved;
}

export default function LiveChat() {
  const { t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<"chat" | "review" | "thanks">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [username, setUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("skyblue-chat-username") || "";
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("skyblue-chat-channel") || null;
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSending, setReviewSending] = useState(false);

  const sessionIdRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const lastMessageId = useRef<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOpenRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  const hasUsername = !!username;
  const hasChannel = !!channelId;
  const view: View = phase === "review" || phase === "thanks"
    ? phase
    : hasUsername && hasChannel
      ? "chat"
      : "username";

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setUnread(0);
      return !prev;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setTimeout(() => {
        if (view === "username") usernameInputRef.current?.focus();
        else if (view === "chat") inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, view]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      const params = new URLSearchParams({ channelId });
      if (lastMessageId.current) params.set("after", lastMessageId.current);
      const res = await fetch(`/api/chat/messages?${params}`);
      const data = await res.json();

      if (data.messages && data.messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
          if (newMsgs.length > 0) {
            lastMessageId.current = data.messages[data.messages.length - 1].id;
            if (!isOpenRef.current) {
              const staffCount = newMsgs.filter((m: ChatMessage) => m.isStaff).length;
              if (staffCount > 0) setUnread((u) => u + staffCount);
            }
            return [...prev, ...newMsgs];
          }
          return prev;
        });
      }
    } catch {
      // silent
    }
  }, [channelId]);

  useEffect(() => {
    if (!channelId || view !== "chat") return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages, channelId, view]);

  const handleUsernameSubmit = useCallback(() => {
    const name = usernameInput.trim();
    if (!name) {
      setUsernameError(true);
      return;
    }
    setUsername(name);
    localStorage.setItem("skyblue-chat-username", name);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [usernameInput]);

  const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUsernameSubmit();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !username) return;

    setSending(true);
    setInput("");
    setStatusMsg(null);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      sender: username,
      content: text,
      timestamp: new Date().toISOString(),
      isStaff: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          sender: username,
          content: text,
          timestamp: new Date().toISOString(),
          channelId: channelId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        if (data.channelId && !channelId) {
          setChannelId(data.channelId);
          localStorage.setItem("skyblue-chat-channel", data.channelId);
        }
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setStatusMsg(data.error || "Mesaj gönderilemedi");
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setStatusMsg("Bağlantı hatası");
      setTimeout(() => setStatusMsg(null), 5000);
    } finally {
      setSending(false);
    }
  };

  const handleEndChat = async () => {
    if (!channelId) return;
    try {
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          sender: username,
          channelId,
          action: "end",
        }),
      });
    } catch {
      // best effort
    }
    setPhase("review");
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) return;
    setReviewSending(true);

    try {
      await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          sender: username,
          channelId,
          action: "review",
          stars: rating,
          review: reviewText.trim(),
        }),
      });
    } catch {
      // best effort
    }

    setPhase("thanks");

    setTimeout(() => {
      setUsername("");
      setChannelId(null);
      setMessages([]);
      setRating(0);
      setReviewText("");
      lastMessageId.current = "";
      localStorage.removeItem("skyblue-chat-username");
      localStorage.removeItem("skyblue-chat-channel");
      localStorage.removeItem("skyblue-chat-session");
      sessionIdRef.current = "";
      setPhase("chat");
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button onClick={handleToggle} className="chat-fab" aria-label={t.liveChat}>
        <MessageIcon size={24} />
        {unread > 0 && <span className="chat-fab-badge">{unread}</span>}
      </button>

      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-dot online" />
              <div>
                <h3>{t.liveChat}</h3>
                <span>{username ? `@${username}` : t.liveChatDesc}</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="chat-close" aria-label="Kapat">✕</button>
          </div>

          {view === "username" && (
            <div className="chat-username-screen">
              <div className="chat-username-icon">
                <MessageIcon size={40} />
              </div>
              <h4>{t.chatUsernameTitle}</h4>
              <p>{t.chatUsernameDesc}</p>
              <input
                ref={usernameInputRef}
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (usernameError) setUsernameError(false);
                }}
                onKeyDown={handleUsernameKeyDown}
                placeholder={t.chatUsernamePlaceholder}
                className={`chat-username-input ${usernameError ? "error" : ""}`}
                maxLength={20}
              />
              {usernameError && <span className="chat-username-error">{t.chatUsernameError}</span>}
              <button onClick={handleUsernameSubmit} className="chat-username-btn">
                {t.chatUsernameStart}
              </button>
            </div>
          )}

          {view === "chat" && (
            <>
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="chat-empty">
                    <MessageIcon size={32} />
                    <p>{t.liveChatDesc}</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-msg ${msg.isStaff ? "staff" : "user"}`}>
                    {msg.isStaff && (
                      <div className="chat-avatar">
                        {msg.avatar ? (
                          <img src={msg.avatar} alt={msg.sender} width={32} height={32} />
                        ) : (
                          <div className="chat-avatar-fallback">S</div>
                        )}
                      </div>
                    )}
                    <div className="chat-msg-bubble">
                      <div className="chat-msg-sender">{msg.sender}</div>
                      <div className="chat-msg-text">{msg.content}</div>
                      <div className="chat-msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {!msg.isStaff && (
                      <div className="chat-avatar">
                        <div className="chat-avatar-fallback user">
                          {username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-footer">
                {statusMsg && <div className="chat-status chat-status-error">{statusMsg}</div>}
                <div className="chat-input-row">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.liveChatInput}
                    className="chat-input"
                    disabled={sending}
                  />
                  <button onClick={sendMessage} disabled={!input.trim() || sending} className="chat-send">
                    {sending ? "..." : "→"}
                  </button>
                </div>
                <button onClick={handleEndChat} className="chat-end-btn">
                  {t.chatEndChat}
                </button>
              </div>
            </>
          )}

          {view === "review" && (
            <div className="chat-review-screen">
              <h4>{t.chatRateTitle}</h4>
              <p>{t.chatRateDesc}</p>
              <div className="chat-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`chat-star ${star <= (hoverRating || rating) ? "active" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <StarIcon size={28} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={t.chatReviewPlaceholder}
                className="chat-review-textarea"
                rows={3}
                maxLength={500}
              />
              <button
                onClick={handleReviewSubmit}
                disabled={rating === 0 || reviewSending}
                className="chat-review-btn"
              >
                {reviewSending ? "..." : t.chatReviewSubmit}
              </button>
            </div>
          )}

          {view === "thanks" && (
            <div className="chat-review-screen">
              <div className="chat-thanks-icon">✓</div>
              <h4>{t.chatReviewThanks}</h4>
            </div>
          )}
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Trash2, Send, Smile, Loader2, CornerUpLeft, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import PageHeader from "@/components/custom/PageHeader";

// List of allowed emojis for reactions
const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// Small round icon action (react / reply / delete); 44px on touch, 36px on desktop
const iconBtn =
  "inline-flex items-center justify-center size-11 lg:size-9 rounded-full text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer";

export default function Guestbook() {
  const { t, lang } = useLanguage();
  const { user, isAdmin, signInWithGoogle } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeReactionMenu, setActiveReactionMenu] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const messagesEndRef = useRef(null);
  const reactionMenuRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("guestbook")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Error fetching guestbook messages:", err.message);
      } finally {
        setIsLoading(false);
        // Scroll to bottom instantly on first load
        setTimeout(() => scrollToBottom("auto"), 100);
      }
    };

    fetchMessages();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("guestbook_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guestbook" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              // Avoid duplicate if insert response was already handled locally
              if (prev.some((msg) => msg.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
            setTimeout(() => scrollToBottom("smooth"), 100);
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close reaction menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reactionMenuRef.current && !reactionMenuRef.current.contains(event.target)) {
        setActiveReactionMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    const parentId = replyingTo ? replyingTo.id : null;
    
    setNewMessage("");
    setReplyingTo(null);

    try {
      const { data, error } = await supabase
        .from("guestbook")
        .insert([
          {
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email.split("@")[0],
            user_email: user.email,
            user_avatar: user.user_metadata?.avatar_url || null,
            message: messageText,
            reactions: {},
            parent_id: parentId,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);
      }
    } catch (err) {
      alert(t("Failed to send message: ") + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (id) => {
    if (!confirm(t("Are you sure you want to delete this message?"))) return;

    try {
      const { error } = await supabase.from("guestbook").delete().eq("id", id);
      if (error) throw error;
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      alert(t("Error deleting message: ") + err.message);
    }
  };

  // Handle Emoji Reaction
  const handleReact = async (messageId, emoji) => {
    if (!user) {
      alert(t("Please sign in to react to messages!"));
      return;
    }

    const messageToUpdate = messages.find((msg) => msg.id === messageId);
    if (!messageToUpdate) return;

    const currentReactions = { ...(messageToUpdate.reactions || {}) };
    const userIds = currentReactions[emoji] ? [...currentReactions[emoji]] : [];

    if (userIds.includes(user.id)) {
      // Remove reaction
      const index = userIds.indexOf(user.id);
      userIds.splice(index, 1);
    } else {
      // Add reaction
      userIds.push(user.id);
    }

    if (userIds.length === 0) {
      delete currentReactions[emoji];
    } else {
      currentReactions[emoji] = userIds;
    }

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, reactions: currentReactions } : msg))
    );
    setActiveReactionMenu(null);

    try {
      const { error } = await supabase
        .from("guestbook")
        .update({ reactions: currentReactions })
        .eq("id", messageId);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating reaction:", err.message);
      // Revert optimistic update on failure by refetching or restoring
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="pb-8">
      <PageHeader title={t("Guestbook")} intro={t("Feel free to share your thoughts, suggestions, questions, or anything else!")} />

      {/* Chat feed */}
      <section
        aria-label={t("Messages")}
        className="mt-8 max-h-[70vh] min-h-[24rem] overflow-y-auto flex flex-col gap-6 py-2 pr-1"
      >
        {isLoading ? (
          <div className="grow flex flex-col items-center justify-center gap-3 text-muted">
            <Loader2 className="size-7 animate-spin" aria-hidden="true" />
            <span>{t("Loading messages...")}</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="grow flex items-center justify-center text-center p-8 text-muted border-[1.5px] border-dashed border-line rounded-card">
            {t("No messages yet. Be the first to write something!")}
          </p>
        ) : (
          <ul className="flex flex-col gap-6">
            {messages.map((msg) => {
              const hasReactions = Object.keys(msg.reactions || {}).length > 0;
              const parentMsg = msg.parent_id ? messages.find((m) => m.id === msg.parent_id) : null;
              const isOwn = user && user.id === msg.user_id;

              return (
                <li
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`flex gap-3 sm:gap-4 group items-start scroll-mt-24 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {msg.user_avatar ? (
                    <Image
                      src={msg.user_avatar}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-9 sm:size-10 rounded-full object-cover bg-surface shrink-0"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="size-9 sm:size-10 rounded-full bg-ink text-on-ink flex items-center justify-center text-sm font-bold uppercase shrink-0"
                    >
                      {msg.user_name?.[0] || "?"}
                    </div>
                  )}

                  <div className={`flex flex-col gap-1.5 max-w-[calc(100%-3rem)] sm:max-w-[75%] ${isOwn ? "items-end" : ""}`}>
                    <div className={`flex items-baseline gap-2 flex-wrap ${isOwn ? "flex-row-reverse" : ""}`}>
                      <span className="text-sm font-semibold">{msg.user_name}</span>
                      <span className="text-xs text-muted">{formatDate(msg.created_at)}</span>
                    </div>

                    {/* Bubble: others on surface, own messages on ink */}
                    <div
                      data-surface={isOwn ? "ink" : undefined}
                      className={`px-4 py-2.5 rounded-[20px] text-[15px] leading-relaxed w-fit break-words ${
                        isOwn ? "bg-ink text-on-ink rounded-tr-md" : "bg-surface text-ink rounded-tl-md"
                      }`}
                    >
                      {parentMsg && (
                        <button
                          type="button"
                          onClick={() => {
                            const parentEl = document.getElementById(`msg-${msg.parent_id}`);
                            parentEl?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                          className={`w-full text-left border-l-[3px] px-3 py-1.5 rounded-lg mb-2 text-[13px] flex flex-col gap-0.5 cursor-pointer ${
                            isOwn ? "bg-ink-line border-accent" : "bg-paper border-ink"
                          }`}
                        >
                          <span className="font-semibold">{parentMsg.user_name}</span>
                          <span className={`line-clamp-1 ${isOwn ? "text-on-ink-muted" : "text-muted"}`}>{parentMsg.message}</span>
                        </button>
                      )}
                      <p>{msg.message}</p>
                    </div>

                    {/* Reactions & actions */}
                    <div className={`flex items-center gap-1 flex-wrap ${isOwn ? "flex-row-reverse" : ""}`}>
                      {hasReactions &&
                        Object.entries(msg.reactions).map(([emoji, userIds]) => {
                          if (!userIds || userIds.length === 0) return null;
                          const hasReacted = user && userIds.includes(user.id);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReact(msg.id, emoji)}
                              aria-pressed={!!hasReacted}
                              className={`inline-flex items-center gap-1 px-3 min-h-11 lg:min-h-9 rounded-full border-[1.5px] text-sm transition-colors cursor-pointer ${
                                hasReacted ? "bg-accent border-accent text-ink font-semibold" : "bg-surface border-line text-ink hover:border-ink"
                              }`}
                            >
                              <span aria-hidden="true">{emoji}</span>
                              <span>{userIds.length}</span>
                            </button>
                          );
                        })}

                      {user && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveReactionMenu(activeReactionMenu === msg.id ? null : msg.id)}
                            aria-label={t("React to message")}
                            aria-expanded={activeReactionMenu === msg.id}
                            className={iconBtn}
                          >
                            <Smile className="size-4" aria-hidden="true" />
                          </button>

                          {activeReactionMenu === msg.id && (
                            <div
                              ref={reactionMenuRef}
                              className={`absolute bottom-12 ${isOwn ? "right-0" : "left-0"} z-30 flex items-center gap-0.5 bg-surface border-[1.5px] border-ink p-1 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-150`}
                            >
                              {EMOJI_LIST.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleReact(msg.id, emoji)}
                                  className="flex items-center justify-center size-11 rounded-full hover:bg-paper transition-colors cursor-pointer text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {user && (
                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          aria-label={t("Reply to message")}
                          className={`${iconBtn} lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100`}
                        >
                          <CornerUpLeft className="size-4" aria-hidden="true" />
                        </button>
                      )}

                      {(isAdmin || (user && user.id === msg.user_id)) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          aria-label={t("Delete message")}
                          className={`${iconBtn} hover:text-destructive lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            <li ref={messagesEndRef} aria-hidden="true" />
          </ul>
        )}
      </section>

      {/* Composer / sign-in */}
      <section className="mt-6 pt-6 border-t-2 border-ink">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <div className="grow flex flex-col">
              {replyingTo && (
                <div className="flex justify-between items-center gap-3 bg-surface border-l-[3px] border-accent pl-4 pr-1 py-1 rounded-t-[20px] text-[13px] animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-semibold">{t("Replying to {name}", { name: replyingTo.user_name })}</span>
                    <span className="text-muted line-clamp-1">{replyingTo.message}</span>
                  </div>
                  <button type="button" onClick={() => setReplyingTo(null)} aria-label={t("Cancel reply")} className={iconBtn}>
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <label htmlFor="guestbook-message" className="sr-only">
                {t("Your message")}
              </label>
              <div className="relative w-full">
                <textarea
                  id="guestbook-message"
                  placeholder={t("Share your thoughts...")}
                  rows={2}
                  maxLength={500}
                  className={`w-full bg-surface border-[1.5px] border-line hover:border-subtle focus:border-ink focus-visible:outline-offset-0 px-4 py-3 pr-16 text-[15px] text-ink placeholder:text-subtle resize-none transition-colors ${
                    replyingTo ? "rounded-b-[20px] rounded-t-none" : "rounded-[20px]"
                  }`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <span className="absolute bottom-3 right-4 text-xs text-subtle tabular-nums" aria-hidden="true">
                  {newMessage.length}/500
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              aria-label={t("Send message")}
              className="inline-flex items-center justify-center size-13 rounded-full bg-accent text-ink disabled:bg-line disabled:text-muted disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 mb-1"
            >
              {isSending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Send className="size-5" aria-hidden="true" />}
            </button>
          </form>
        ) : (
          <div data-surface="ink" className="rounded-panel bg-ink text-on-ink p-8 flex flex-col items-start gap-5">
            <p className="font-display font-bold text-2xl sm:text-[28px] leading-tight tracking-[-0.02em] max-w-[560px]">
              {t("Please sign in to join the conversation. Don't worry, your data is safe with us.")}
            </p>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2.5 min-h-12 px-6 rounded-full bg-accent text-ink text-[15px] font-semibold cursor-pointer"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                width={18}
                height={18}
                unoptimized
                className="size-[18px]"
                alt=""
              />
              {t("Login with Google")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

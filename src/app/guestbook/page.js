"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Send, Smile, Loader2, CornerUpLeft, X } from "lucide-react";
import { PiChatText } from "react-icons/pi";
import { useLanguage } from "@/hooks/useLanguage";

// List of allowed emojis for reactions
const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

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
    <div className="w-full">

      <motion.div
        animate={{ y: 0, opacity: 1 }}
        initial={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full space-y-6 pb-4 flex flex-col h-[calc(100vh-11rem)] min-h-[28rem]"
      >
        {/* Header */}
        <section className="flex flex-col gap-2 shrink-0">
          <h1 className="text-2xl font-medium tracking-tighter flex items-center gap-2">
            <PiChatText className="size-6 text-emerald-500" />{t("Guestbook")}</h1>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">{t("Feel free to share your thoughts, suggestions, questions, or anything else!")}</p>
        </section>

        <hr className="border-neutral-800 border-dashed shrink-0" />

        {/* Chat Feed */}
        <div className="grow overflow-y-auto bg-transparent sm:bg-neutral-900/20 border-0 sm:border border-neutral-900 rounded-3xl p-1 sm:p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {isLoading ? (
            <div className="grow flex flex-col items-center justify-center gap-2 text-neutral-500">
              <Loader2 className="size-8 animate-spin text-emerald-500" />
              <span>{t("Loading messages...")}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="grow flex flex-col items-center justify-center text-center p-8 text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
              <PiChatText className="size-12 mb-3 text-neutral-700" />
              <p className="text-sm font-medium">{t("No messages yet. Be the first to write something!")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((msg) => {
                const hasReactions = Object.keys(msg.reactions || {}).length > 0;
                const parentMsg = msg.parent_id ? messages.find((m) => m.id === msg.parent_id) : null;

                return (
                  <div key={msg.id} id={`msg-${msg.id}`} className="flex gap-2.5 sm:gap-4 group items-start scroll-mt-24">
                    {/* User Avatar */}
                    {msg.user_avatar ? (
                      <Image
                        src={msg.user_avatar}
                        alt={msg.user_name}
                        width={40}
                        height={40}
                        unoptimized
                        className="size-8.5 sm:size-10 rounded-full object-cover border border-neutral-800 shrink-0"
                      />
                    ) : (
                      <div className="size-8.5 sm:size-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 uppercase shrink-0">
                        {msg.user_name?.[0] || "?"}
                      </div>
                    )}

                    {/* Message Details */}
                    <div className="flex flex-col gap-1.5 max-w-[calc(100%-2.5rem)] sm:max-w-[75%]">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-neutral-200">
                          {msg.user_name}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>

                      {/* Chat Bubble */}
                      <div className="relative bg-neutral-900/60 border border-neutral-850 text-neutral-200 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tl-none text-xs sm:text-sm leading-relaxed shadow-sm w-fit break-words">
                        {/* Parent Quote Block */}
                        {parentMsg && (
                          <div
                            onClick={() => {
                              const parentEl = document.getElementById(`msg-${msg.parent_id}`);
                              parentEl?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                            className="bg-neutral-950/50 border-l-[3px] border-emerald-500 px-2.5 py-1.5 rounded-lg mb-2 text-[10px] sm:text-xs flex flex-col gap-0.5 cursor-pointer max-w-full hover:bg-neutral-950/80 transition-colors"
                          >
                            <span className="font-bold text-emerald-400">
                              {parentMsg.user_name}
                            </span>
                            <span className="text-neutral-400 line-clamp-1">
                              {parentMsg.message}
                            </span>
                          </div>
                        )}
                        
                        <div>{msg.message}</div>
                      </div>

                      {/* Reactions & Actions Row */}
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {/* Render Reactions */}
                        {hasReactions &&
                          Object.entries(msg.reactions).map(([emoji, userIds]) => {
                            if (!userIds || userIds.length === 0) return null;
                            const hasReacted = user && userIds.includes(user.id);
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg.id, emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-all cursor-pointer ${
                                  hasReacted
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold"
                                    : "bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-neutral-200"
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                              </button>
                            );
                          })}

                        {/* Add Reaction Button (+ icon) */}
                        {user && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveReactionMenu(activeReactionMenu === msg.id ? null : msg.id)
                              }
                              className="flex items-center justify-center size-6 rounded-full border border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-neutral-300 bg-neutral-900/50 hover:bg-neutral-900 transition-colors cursor-pointer"
                              title={t("React to message")}
                            >
                              <Smile className="size-3.5" />
                            </button>

                            {/* Reaction Emoji Menu */}
                            {activeReactionMenu === msg.id && (
                              <div
                                ref={reactionMenuRef}
                                className="absolute bottom-7 left-0 z-30 flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
                              >
                                {EMOJI_LIST.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReact(msg.id, emoji)}
                                    className="hover:scale-125 transition-transform p-1 cursor-pointer text-base"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reply Button */}
                        {user && (
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-all duration-200 cursor-pointer"
                            title={t("Reply to message")}
                          >
                            <CornerUpLeft className="size-3.5" />
                          </button>
                        )}

                        {/* Delete Button (If author or Admin) */}
                        {(isAdmin || (user && user.id === msg.user_id)) && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-all duration-200 cursor-pointer ml-1"
                            title={t("Delete message")}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Auth status & Chat Input Section */}
        <section className="shrink-0">
          {user ? (
            <form onSubmit={handleSendMessage} className="flex gap-2.5 items-end">
              {/* Profile Avatar */}
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="My Profile"
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10 rounded-full border border-neutral-800 mb-1 hidden sm:block shrink-0"
                />
              ) : (
                <div className="size-10 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 mb-1 hidden sm:block shrink-0">
                  {user.email?.[0]?.toUpperCase()}
                </div>
              )}

              {/* Input & Reply Container */}
              <div className="grow flex flex-col relative">
                {/* Reply Preview Bar */}
                {replyingTo && (
                  <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 border-b-0 border-l-[3px] border-l-emerald-500 px-4 py-2 rounded-t-2xl text-xs backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
                    <div className="flex flex-col gap-0.5 truncate pr-4">
                      <span className="font-bold text-emerald-400">{t("Replying to {name}", { name: replyingTo.user_name })}</span>
                      <span className="text-neutral-400 line-clamp-1">{replyingTo.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-neutral-500 hover:text-neutral-300 p-1 shrink-0 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
                
                <div className="relative w-full">
                  <textarea
                    placeholder={t("Share your thoughts...")}
                    rows={2}
                    maxLength={500}
                    className={`w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500/50 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 outline-none resize-none pr-12 focus:ring-1 focus:ring-emerald-500/20 ${
                      replyingTo ? "rounded-b-2xl rounded-t-none border-t-0" : "rounded-2xl"
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
                  <span className="absolute bottom-2 right-3 text-[10px] text-neutral-600 font-mono">
                    {newMessage.length}/500
                  </span>
                </div>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-medium p-3 rounded-2xl transition-all cursor-pointer shrink-0 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/10 active:scale-95 flex items-center justify-center h-11 w-11"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </form>
          ) : (
            <div className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-5 text-center flex flex-col items-center gap-3">
              <p className="text-xs sm:text-sm text-neutral-400">{t("Please sign in to join the conversation. Don't worry, your data is safe with us.")}</p>
              <button
                onClick={signInWithGoogle}
                className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 text-xs py-2 px-4 rounded-xl cursor-pointer font-medium hover:border-neutral-600 transition-all flex items-center gap-2 active:scale-95"
              >
                <Image
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  width={16}
                  height={16}
                  unoptimized
                  className="size-4"
                  alt="Google"
                />
                <span>{t("Login with Google")}</span>
              </button>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}

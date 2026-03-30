// lib/conversations.js
// Supabase helpers for EDGEX conversation persistence.
// All DB access for chat history goes through this file.
import { supabase } from "./supabase";

export async function createConversation(userId, title = "New conversation") {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title })
    .select("id, title, created_at, updated_at, pinned, pinned_at")
    .single();
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function listConversations(userId) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at, pinned, pinned_at")
    .eq("user_id", userId)
    .order("pinned",      { ascending: false })   // pinned first
    .order("pinned_at",   { ascending: false, nullsFirst: false })
    .order("updated_at",  { ascending: false })
    .limit(50);
  if (error) return { data: [], error };
  return { data: data || [], error: null };
}

export async function loadConversation(conversationId, userId) {
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, meta, created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) return { data: [], error };
  return { data: data || [], error: null };
}

export async function saveMessage({ conversationId, userId, role, content, meta = null }) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
      meta,
    })
    .select("id, role, content, meta, created_at")
    .single();
  if (error) return { data: null, error };
  const { error: touchError } = await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", userId);
  if (touchError) return { data, error: touchError };
  return { data, error: null };
}

export async function updateConversationTitle(conversationId, userId, title) {
  const trimmed = (title || "").trim().slice(0, 100) || "New conversation";
  const { data, error } = await supabase
    .from("conversations")
    .update({ title: trimmed })
    .eq("id", conversationId)
    .eq("user_id", userId)
    .select("id, title")
    .single();
  if (error) return { data: null, error };
  return { data, error: null };
}

// ─── New: Delete ───────────────────────────────────────────────────────────────
export async function deleteConversation(conversationId, userId) {
  // Delete messages first (RLS may require this order)
  const { error: msgError } = await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
  if (msgError) return { error: msgError };

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);
  if (error) return { error };
  return { error: null };
}

// ─── New: Pin / Unpin ──────────────────────────────────────────────────────────
export async function togglePinConversation(conversationId, userId, pin) {
  const { data, error } = await supabase
    .from("conversations")
    .update({
      pinned:    pin,
      pinned_at: pin ? new Date().toISOString() : null,
    })
    .eq("id", conversationId)
    .eq("user_id", userId)
    .select("id, pinned, pinned_at")
    .single();
  if (error) return { data: null, error };
  return { data, error: null };
}

// ─── New: Rename ───────────────────────────────────────────────────────────────
export async function renameConversation(conversationId, userId, title) {
  return updateConversationTitle(conversationId, userId, title);
}

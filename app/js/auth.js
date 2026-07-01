import { supabase } from "./supabaseClient.js";

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getMyProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", session.user.id)
    .single();
  if (error) throw error;
  return data;
}

// Redireciona para a tela de login se não houver sessão ativa.
// Use no topo de qualquer página autenticada.
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = "./index.html";
    return null;
  }
  return session;
}

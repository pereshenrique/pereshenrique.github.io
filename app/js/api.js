import { supabase } from "./supabaseClient.js";

// -----------------------------------------------------------------------
// Perfis / equipe
// -----------------------------------------------------------------------
export async function listProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data;
}

export async function updateProfileRole(userId, role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw error;
}

// -----------------------------------------------------------------------
// Clientes
// -----------------------------------------------------------------------
export async function listClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("archived", false)
    .order("name");
  if (error) throw error;
  return data;
}

export async function createClient({ name, color }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("clients")
    .insert({ name, color: color || "#F7C948", created_by: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveClient(id) {
  const { error } = await supabase.from("clients").update({ archived: true }).eq("id", id);
  if (error) throw error;
}

// -----------------------------------------------------------------------
// Quadros (boards)
// -----------------------------------------------------------------------
const DEFAULT_STAGES_CONTENT = ["Briefing", "Roteiro/Copy", "Produção", "Revisão", "Aprovação", "Publicado"];
const DEFAULT_STAGES_GENERIC = ["A Fazer", "Em andamento", "Concluído"];

export async function listBoards() {
  const { data, error } = await supabase
    .from("boards")
    .select("*, clients(id, name, color)")
    .eq("archived", false)
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function getBoard(id) {
  const { data, error } = await supabase
    .from("boards")
    .select("*, clients(id, name, color)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBoard({ name, type, client_id }) {
  const { data: userData } = await supabase.auth.getUser();
  const { data: board, error } = await supabase
    .from("boards")
    .insert({ name, type, client_id: client_id || null, created_by: userData.user.id })
    .select()
    .single();
  if (error) throw error;

  // cria automaticamente as etapas padrão + garante que o criador tenha acesso
  const defaults = type === "content" ? DEFAULT_STAGES_CONTENT : DEFAULT_STAGES_GENERIC;
  const stageRows = defaults.map((name, i) => ({ board_id: board.id, name, position: i }));
  const { error: stageError } = await supabase.from("stages").insert(stageRows);
  if (stageError) throw stageError;

  await supabase.from("board_members").insert({ board_id: board.id, user_id: userData.user.id });

  return board;
}

export async function createClientWithBoard({ name, color }) {
  const client = await createClient({ name, color });
  const board = await createBoard({ name: `Conteúdo — ${name}`, type: "content", client_id: client.id });
  return { client, board };
}

export async function archiveBoard(id) {
  const { error } = await supabase.from("boards").update({ archived: true }).eq("id", id);
  if (error) throw error;
}

// -----------------------------------------------------------------------
// Membros do quadro (permissões)
// -----------------------------------------------------------------------
export async function listBoardMembers(boardId) {
  const { data, error } = await supabase
    .from("board_members")
    .select("user_id, profiles(id, full_name, email)")
    .eq("board_id", boardId);
  if (error) throw error;
  return data;
}

export async function addBoardMember(boardId, userId) {
  const { error } = await supabase.from("board_members").insert({ board_id: boardId, user_id: userId });
  if (error) throw error;
}

export async function removeBoardMember(boardId, userId) {
  const { error } = await supabase
    .from("board_members")
    .delete()
    .eq("board_id", boardId)
    .eq("user_id", userId);
  if (error) throw error;
}

// -----------------------------------------------------------------------
// Etapas (colunas do kanban)
// -----------------------------------------------------------------------
export async function listStages(boardId) {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("board_id", boardId)
    .order("position");
  if (error) throw error;
  return data;
}

export async function createStage(boardId, name) {
  const stages = await listStages(boardId);
  const position = stages.length ? Math.max(...stages.map((s) => s.position)) + 1 : 0;
  const { data, error } = await supabase
    .from("stages")
    .insert({ board_id: boardId, name, position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function renameStage(id, name) {
  const { error } = await supabase.from("stages").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteStage(id) {
  const { error } = await supabase.from("stages").delete().eq("id", id);
  if (error) throw error;
}

// -----------------------------------------------------------------------
// Tarefas
// -----------------------------------------------------------------------
export async function listTasksForBoard(boardId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, profiles:assignee_id(id, full_name)")
    .eq("board_id", boardId)
    .order("position");
  if (error) throw error;
  return data;
}

// Visão macro: todas as tarefas de todos os quadros visíveis ao usuário
// (o RLS já filtra automaticamente pelos quadros que ele tem acesso).
export async function listAllVisibleTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "*, profiles:assignee_id(id, full_name), boards(id, name, type, clients(id, name, color)), stages(id, name)"
    )
    .order("deadline", { nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function createTask(boardId, stageId, fields) {
  const { data: userData } = await supabase.auth.getUser();
  const existing = await supabase
    .from("tasks")
    .select("position")
    .eq("board_id", boardId)
    .eq("stage_id", stageId)
    .order("position", { ascending: false })
    .limit(1);
  const position = existing.data && existing.data.length ? existing.data[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("tasks")
    .insert({ board_id: boardId, stage_id: stageId, position, created_by: userData.user.id, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, fields) {
  const { data, error } = await supabase.from("tasks").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function moveTask(id, stageId, position) {
  const { error } = await supabase.from("tasks").update({ stage_id: stageId, position }).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

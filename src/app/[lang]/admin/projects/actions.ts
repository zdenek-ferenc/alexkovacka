'use server';

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export type Project = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  is_published: boolean;
  order_index: number;
  description_cs: string | null;
  description_en: string | null;
};
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function addProject(prevState: unknown, formData: FormData) {
  console.log("[DEBUG 1] Serverová akce 'addProject' spuštěna.");

  if (!process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY.length < 20) {
    console.error("[KRITICKÁ CHYBA] SUPABASE_SERVICE_KEY chybí nebo je příliš krátký!");
    return { error: "Konfigurace serveru chybí (SERVICE_KEY).", success: false };
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("[KRITICKÁ CHYBA] NEXT_PUBLIC_SUPABASE_URL chybí!");
    return { error: "Konfigurace serveru chybí (URL).", success: false };
  }
  console.log("[DEBUG 2] Proměnné prostředí nalezeny, vytvářím admin klienta.");

  const supabaseAdmin = createAdminClient();
  
  const name = formData.get('name') as string;
  const description_cs = formData.get('description_cs') as string;
  const description_en = formData.get('description_en') as string;

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u00e0-\u00e6]/g, "a") 
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');

  if (!name) {
    console.warn("[DEBUG 3] Pokus o přidání projektu bez názvu.");
    return { error: "Název projektu je povinný.", success: false };
  }

  console.log(`[DEBUG 4] Zjišťuji pořadí pro nový projekt: ${name}`);
  const { count, error: countError } = await supabaseAdmin
    .from('projects')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error("[DEBUG 5] Chyba při zjišťování pořadí:", countError.message);
    return { error: `Chyba při zjišťování pořadí: ${countError.message}`, success: false };
  }

  console.log(`[DEBUG 6] Vkládám projekt '${name}' (Slug: ${slug}) do databáze...`);
  const { error } = await supabaseAdmin.from('projects').insert([{ 
    name, 
    slug,
    is_published: false, 
    order_index: count ?? 0,
    description_cs: description_cs || null,
    description_en: description_en || null
  }]);

  if (error) {
    console.error("[!!! DEBUG 7] Chyba při ukládání (insert):", error.message);
    return { error: `Chyba při ukládání: ${error.message}`, success: false };
  }

  console.log("[DEBUG 8] Projekt úspěšně uložen. Revaliduji cesty.");
  revalidatePath('/admin/projects');
  revalidatePath('/');
  return { success: true, error: null };
}

export async function deleteProject(id: number) {
  const supabaseAdmin = createAdminClient(); // Použij admin klienta
  const { error, count } = await supabaseAdmin
    .from('projects')
    .delete({ count: 'exact' }) 
    .eq('id', id);
  if (error) {
    throw new Error(`Chyba při mazání: ${error.message}`);
  }
  
  revalidatePath('/admin/projects');
  revalidatePath('/');
}

export async function toggleProjectVisibility(id: number, currentState: boolean) {
  const supabaseAdmin = createAdminClient(); 
  const { error } = await supabaseAdmin
    .from('projects')
    .update({ is_published: !currentState })
    .eq('id', id);
  if (error) {
    throw new Error(`Chyba při změně viditelnosti: ${error.message}`);
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
}

export async function updateProjectOrder(projects: Project[]) {
  const supabaseAdmin = createAdminClient(); 
  if (!projects) return;

  const updates = projects.map((project, index) =>
    supabaseAdmin 
      .from('projects')
      .update({ order_index: index })
      .eq('id', project.id)
  );
  
  const results = await Promise.all(updates);
  const firstError = results.find((r: { error?: unknown }) => r && r.error);
  if (firstError && firstError.error) {
    throw new Error(`Chyba při ukládání pořadí: ${(firstError.error as Error).message}`);
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
}
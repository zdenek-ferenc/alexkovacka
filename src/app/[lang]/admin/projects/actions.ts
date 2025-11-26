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
  main_image_url: string | null;
  title_style: 'white_text' | 'white_on_black' | 'black_text' | 'black_on_white' | null;
  // Nová pole
  parent_id: number | null;
  is_collection: boolean;
};

function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || serviceKey.length < 50) {
    console.error("!!! CHYBA: SUPABASE_SERVICE_KEY chybí nebo je krátký.");
  }

  return createClient(
    url!,
    serviceKey!,
    { auth: { persistSession: false } }
  );
}

export async function addProject(prevState: unknown, formData: FormData) {
  const supabaseAdmin = createAdminClient();

  const name = formData.get('name') as string;
  const description_cs = formData.get('description_cs') as string;
  const description_en = formData.get('description_en') as string;

  // Získání nových hodnot z formuláře
  const is_collection = formData.get('is_collection') === 'on';
  const parent_id_raw = formData.get('parent_id') as string;
  const parent_id = parent_id_raw && parent_id_raw !== 'none' ? parseInt(parent_id_raw) : null;

  if (!name) {
    return { error: "Název projektu je povinný.", success: false };
  }

  const createSlug = (text: string) => text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');

  let slug = createSlug(name);

  const { data: existingProject, error: checkError } = await supabaseAdmin
    .from('projects')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();

  if (checkError) {
    console.error("Chyba při kontrole slugu:", checkError.message);
    return { error: `Chyba při kontrole slugu: ${checkError.message}`, success: false };
  }

  if (existingProject) {
    const uniqueSuffix = Date.now().toString().slice(-6);
    slug = `${slug}-${uniqueSuffix}`;
  }

  const { count, error: countError } = await supabaseAdmin
    .from('projects')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return { error: `Chyba při zjišťování pořadí: ${countError.message}`, success: false };
  }

  const { error } = await supabaseAdmin.from('projects').insert([{
    name,
    slug,
    is_published: false,
    order_index: count ?? 0,
    description_cs: description_cs || null,
    description_en: description_en || null,
    is_collection,
    parent_id
  }]);

  if (error) {
    return { error: `Chyba při ukládání: ${error.message}`, success: false };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
  return { success: true, error: null };
}

export async function deleteProject(id: number) {
  const supabaseAdmin = createAdminClient();

  const { error, count } = await supabaseAdmin
    .from('projects')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    throw new Error(`Chyba při mazání: ${error.message}. (Pokud je to kolekce, ujisti se, že je prázdná)`);
  }
  if (count === 0 || count === null) {
    throw new Error('Projekt se nepodařilo smazat.');
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

export async function assignProjectToCollection(projectId: number, parentId: number | null) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('projects')
    .update({ parent_id: parentId })
    .eq('id', projectId);

  if (error) {
    throw new Error(`Chyba při řazení do kolekce: ${error.message}`);
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
}
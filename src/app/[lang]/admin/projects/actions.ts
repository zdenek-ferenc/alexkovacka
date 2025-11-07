'use server';

import { supabase } from "../../../../lib/supabaseClient";
import { revalidatePath } from "next/cache";

export type Project = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  is_published: boolean;
  order_index: number;
};

export async function addProject(prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string;

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');

  if (!name) {
    return { error: "Název projektu je povinný.", success: false };
  }

  const { count, error: countError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return { error: `Chyba při zjišťování pořadí: ${countError.message}`, success: false };
  }

  const { error } = await supabase.from('projects').insert([{ 
    name, 
    slug,
    is_published: false, 
    order_index: count ?? 0
  }]);

  if (error) {
    return { error: `Chyba při ukládání: ${error.message}`, success: false };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
  return { success: true, error: null };
}

export async function deleteProject(id: number) {
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return { error: `Chyba při mazání: ${error.message}` };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
}

export async function toggleProjectVisibility(id: number, currentState: boolean) {
  const { error } = await supabase
    .from('projects')
    .update({ is_published: !currentState })
    .eq('id', id);

  if (error) {
    return { error: `Chyba při změně viditelnosti: ${error.message}` };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
}

export async function updateProjectOrder(projects: Project[]) {
  if (!projects) return;

  const updates = projects.map((project, index) =>
    supabase
      .from('projects')
      .update({ order_index: index })
      .eq('id', project.id)
  );
  
  const results = await Promise.all(updates);

  const firstError = results.find((r: { error?: unknown }) => r && r.error);
  if (firstError && firstError.error) {
    return { error: `Chyba při ukládání pořadí: ${firstError.error.message}` };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');

}

'use server';

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export async function addProject(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;

  // Vytvoříme 'slug'
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');

  if (!name) {
    return { error: "Název projektu je povinný.", success: false };
  }

  // Vložíme data
  const { error } = await supabase.from('projects').insert([{ name, slug }]);

  if (error) {
    return { error: `Chyba při ukládání: ${error.message}`, success: false };
  }

  // Vše proběhlo OK
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



'use server';

// 1. Změněný import - importujeme pouze 'createClient'
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// 2. Odebrali jsme import starého veřejného klienta:
// import { supabase } from "../../../../lib/supabaseClient"; 

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

// 3. Přidali jsme funkci pro vytvoření Admin klienta
// Tato funkce používá SUPABASE_SERVICE_KEY a obchází RLS
function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Tato zpráva se ukáže v terminálu, kde běží 'npm run dev'
  if (!serviceKey || serviceKey.length < 50) {
    console.error("-----------------------------------------------------");
    console.error("!!! KRITICKÁ CHYBA NA SERVERU (localhost) !!!");
    console.error("!!! SUPABASE_SERVICE_KEY nebyl nalezen v .env.local nebo je příliš krátký.");
    console.error("!!! Ujisti se, že máš v rootu soubor .env.local a RESTARToval jsi server (npm run dev).");
    console.error("-----------------------------------------------------");
  }
  
  if (!url) {
     console.error("!!! CHYBA: NEXT_PUBLIC_SUPABASE_URL také chybí!");
  }

  return createClient(
    url!,
    serviceKey!, // Použijeme ověřenou proměnnou
    { auth: { persistSession: false } }
  );
}

// 4. Upravená funkce addProject
export async function addProject(prevState: unknown, formData: FormData) {
  // Používáme admin klienta
  const supabaseAdmin = createAdminClient(); 

  const name = formData.get('name') as string;
  const description_cs = formData.get('description_cs') as string;
  const description_en = formData.get('description_en') as string;

  if (!name) {
    return { error: "Název projektu je povinný.", success: false };
  }

  // Pomocná funkce na vytvoření slugu
  const createSlug = (text: string) => text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');

  let slug = createSlug(name);

  // Kontrola, zda slug již existuje
  const { data: existingProject, error: checkError } = await supabaseAdmin
    .from('projects')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle(); // Vrátí projekt nebo null

  if (checkError) {
    console.error("Chyba při kontrole slugu:", checkError.message);
    return { error: `Chyba při kontrole slugu: ${checkError.message}`, success: false };
  }

  // Pokud existuje, přidáme unikátní příponu
  if (existingProject) {
    const uniqueSuffix = Date.now().toString().slice(-6); 
    slug = `${slug}-${uniqueSuffix}`;
  }

  // Zjistíme pořadí (pomocí admin klienta)
  const { count, error: countError } = await supabaseAdmin
    .from('projects')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return { error: `Chyba při zjišťování pořadí: ${countError.message}`, success: false };
  }

  // Vložíme projekt (pomocí admin klienta)
  const { error } = await supabaseAdmin.from('projects').insert([{ 
    name, 
    slug,
    is_published: false, 
    order_index: count ?? 0,
    description_cs: description_cs || null,
    description_en: description_en || null
  }]);

  if (error) {
    return { error: `Chyba při ukládání: ${error.message}`, success: false };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
  return { success: true, error: null };
}

// 5. Upravená funkce deleteProject
export async function deleteProject(id: number) {
  // Používáme admin klienta
  const supabaseAdmin = createAdminClient();
  
  const { error, count } = await supabaseAdmin
    .from('projects')
    .delete({ count: 'exact' }) 
    .eq('id', id);

  if (error) {
    throw new Error(`Chyba při mazání: ${error.message}`);
  }
  if (count === 0 || count === null) {
    throw new Error('Projekt se nepodařilo smazat (pravděpodobně kvůli RLS oprávněním nebo již neexistuje).');
  }

  revalidatePath('/admin/projects');
  revalidatePath('/');
}

// 6. Upravená funkce toggleProjectVisibility
export async function toggleProjectVisibility(id: number, currentState: boolean) {
  // Používáme admin klienta
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

// 7. Upravená funkce updateProjectOrder
export async function updateProjectOrder(projects: Project[]) {
  // Používáme admin klienta
  const supabaseAdmin = createAdminClient();
  
  if (!projects) return;

  const updates = projects.map((project, index) =>
    // Používáme admin klienta
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
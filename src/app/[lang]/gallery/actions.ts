'use server';

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Funkce `upsert` zajistí vytvoření záznamu, pokud neexistuje,
// nebo aktualizaci, pokud existuje.
const upsertSelection = async (photoId: number, clientId: string, data: object) => {
  const supabaseAdmin = createAdminClient();
  return supabaseAdmin
    .from('client_selections')
    .upsert(
      { 
        photo_id: photoId,
        client_id: clientId,
        ...data 
      },
      { 
        onConflict: 'client_id, photo_id' // Toto je náš unikátní klíč
      }
    );
};

// --- ZDE JSOU ZMĚNY ---

// Akce pro přidání fotky do výběru (Lajk)
export async function selectClientPhoto(photoId: number, clientId: string) {
  // `upsert` nastaví `is_liked` na true. Komentář nechá na pokoji.
  const { error } = await upsertSelection(photoId, clientId, { is_liked: true });

  if (error) {
    console.error(error);
    return { error: error.message };
  }
  revalidatePath('/admin/clients');
}

// Akce pro odebrání fotky z výběru (Odebrání lajku)
export async function deselectClientPhoto(photoId: number, clientId: string) {
  const supabaseAdmin = createAdminClient();
  
  // Použijeme `update` místo `delete`. Jen odškrtneme lajk.
  const { error } = await supabaseAdmin
    .from('client_selections')
    .update({ is_liked: false }) // <-- Pouze změníme stav
    .eq('photo_id', photoId)
    .eq('client_id', clientId);

  if (error) {
    console.error(error);
    return { error: error.message };
  }
  revalidatePath('/admin/clients');
}

// Akce pro uložení komentáře
export async function saveClientComment(photoId: number, clientId: string, commentText: string) {
  const trimmedComment = commentText.trim();

  // `upsert` nastaví komentář. Lajk nechá na pokoji.
  const { error } = await upsertSelection(photoId, clientId, { 
    comment: trimmedComment || null 
  });

  if (error) {
    console.error(error);
    return { error: error.message };
  }
  revalidatePath('/admin/clients');
  return { success: true };
}
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
        onConflict: 'client_id, photo_id' 
      }
    );
};


export async function selectClientPhoto(photoId: number, clientId: string) {
  const { error } = await upsertSelection(photoId, clientId, { is_liked: true });

  if (error) {
    console.error(error);
    return { error: error.message };
  }
  revalidatePath('/admin/clients');
}

export async function deselectClientPhoto(photoId: number, clientId: string) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('client_selections')
    .update({ is_liked: false }) 
    .eq('photo_id', photoId)
    .eq('client_id', clientId);

  if (error) {
    console.error(error);
    return { error: error.message };
  }
  revalidatePath('/admin/clients');
}

export async function saveClientComment(photoId: number, clientId: string, commentText: string) {
  const trimmedComment = commentText.trim();

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
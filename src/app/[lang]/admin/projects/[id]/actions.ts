
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

export async function createUploadUrl(projectId: string, fileName: string, isMain: boolean) {
  const supabaseAdmin = createAdminClient();
  
  
  const safeFileName = fileName
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, '-') 
    .replace(/[^\w.\-]/g, ''); 

  const folder = isMain ? 'main' : 'gallery';
  
  const filePath = `${projectId}/${folder}-${Date.now()}-${safeFileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('photos')
    .createSignedUploadUrl(filePath);

  if (error) {
    return { failure: { error: error.message } };
  }

  return { success: { path: filePath, signedUrl: data.signedUrl } };
}

export async function saveImageUrl(projectId: string, filePath: string, isMain: boolean) {
  const supabaseAdmin = createAdminClient();
  const { data: { publicUrl } } = supabaseAdmin.storage.from('photos').getPublicUrl(filePath);

  let dbError;

  if (isMain) {
    const { error } = await supabaseAdmin
      .from('projects')
      .update({ main_image_url: publicUrl })
      .eq('id', projectId);
    dbError = error;
  } else {
    const { error } = await supabaseAdmin.from('photos').insert({
      project_id: projectId,
      image_url: publicUrl,
    });
    dbError = error;
  }
  if (dbError) {
    return { error: `Chyba při ukládání do databáze: ${dbError.message}` };
  }
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: "Fotka úspěšně uložena!" };
}

export async function deleteGalleryImage(projectId: number, imageUrl: string) {
  const supabaseAdmin = createAdminClient();
  const filePath = imageUrl.substring(imageUrl.indexOf('/photos/') + '/photos/'.length);
  const { error: storageError } = await supabaseAdmin.storage
    .from('photos')
    .remove([filePath]);

  if (storageError) {
    console.error("Chyba při mazání souboru z úložiště:", storageError);
  }
  const { error: dbError } = await supabaseAdmin
    .from('photos')
    .delete()
    .eq('image_url', imageUrl); 

  if (dbError) {
    return { error: `Chyba při mazání z databáze: ${dbError.message}` };
  }
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: "Fotka byla smazána." };
}

export async function saveGalleryImageUrls(projectId: string, paths: string[]) {
  const supabaseAdmin = createAdminClient();
  const photoObjects = paths.map(path => {
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(path);
    
    return {
      project_id: projectId,
      image_url: publicUrl,
    };
  });

  const { error } = await supabaseAdmin
    .from('photos')
    .insert(photoObjects);

  if (error) {
    return { error: `Chyba při hromadném ukládání do databáze: ${error.message}` };
  }
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}`); 
  revalidatePath('/'); 
  return { success: "Všechny fotky úspěšně uloženy!" };
}

export async function updateProjectName(id: number, newName: string) {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { error: 'Název nesmí být prázdný.' };
  }
  const newSlug = trimmedName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
  
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('projects')
    .update({ name: trimmedName, slug: newSlug })
    .eq('id', id);

  if (error) {
    return { error: `Chyba při ukládání: ${error.message}` };
  }
  revalidatePath(`/admin/projects/${id}`); 
  revalidatePath('/admin/projects'); 
  revalidatePath('/'); 
  revalidatePath(`/projects/${newSlug}`); 
  return { success: true, newName: trimmedName, newSlug };
}
export async function updateProjectTitleStyle(id: number, newStyle: string) {
  const supabaseAdmin = createAdminClient();
  const validStyles = ['white_text', 'white_on_black', 'black_text', 'black_on_white'];
  if (!validStyles.includes(newStyle)) {
    return { error: 'Neplatný styl.' };
  }

  const { error } = await supabaseAdmin
    .from('projects')
    .update({ title_style: newStyle })
    .eq('id', id);

  if (error) {
    return { error: `Chyba při ukládání: ${error.message}` };
  }
  revalidatePath(`/admin/projects/${id}`);
  
  const { data: project } = await supabaseAdmin.from('projects').select('slug').eq('id', id).single();
  if (project) {
    revalidatePath(`/projects/${project.slug}`);
  }
  
  return { success: true };
}
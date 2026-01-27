import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase keys not found. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables.");
}

export { supabase };

export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

/**
 * Comprime un'immagine base64 lato client.
 * Riducendo la qualità a 0.6 e il maxWidth a 800px, abbattiamo il peso del database egress
 * quando le righe vengono caricate nelle liste.
 */
export const compressImage = (base64: string, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!base64.startsWith('data:image')) return resolve(base64);
    
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Canvas context error");
      
      ctx.drawImage(img, 0, 0, width, height);
      // Utilizziamo jpeg per la massima compressione del testo Base64 nel DB
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64); // In caso di errore procediamo con l'originale per non bloccare il flusso
  });
};

export const base64ToBlob = (base64: string): Blob | null => {
  try {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Error converting base64 to blob", e);
    return null;
  }
};

export const uploadImage = async (base64: string, bucket: string, path: string): Promise<string | null> => {
  if (!supabase) return null;
  
  let finalBase64 = base64;
  if (base64.startsWith('data:image')) {
    try {
      finalBase64 = await compressImage(base64);
    } catch (e) {
      console.warn("Compression failed, using original", e);
    }
  }

  const blob = base64ToBlob(finalBase64);
  if (!blob) return null;

  const fileName = `${path}-${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: true
    });

  if (error) {
    console.error("Error uploading image to storage:", error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
};
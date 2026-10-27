import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

// Mantém a foto fora dos parâmetros da URL, preservando seus dados entre as telas.
type Capture = { id: string; uri: string; base64: string; mimeType: string };

let capture: Capture | null = null;

export function saveNotaFiscalCapture(base64: string, mimeType: string): Capture {
  capture = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    uri: `data:${mimeType};base64,${base64}`,
    base64,
    mimeType,
  };
  return capture;
}

export function getNotaFiscalCapture(id?: string): Capture | null {
  return capture?.id === id ? capture : null;
}

export function clearNotaFiscalCapture(id: string): void {
  if (capture?.id === id) capture = null;
}

export async function createNotaFiscalAttachment(photo: Capture): Promise<{
  blob: Blob;
  dispose: () => void;
}> {
  const binary = atob(photo.base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  if (Platform.OS === "web") {
    return { blob: new Blob([bytes], { type: photo.mimeType }), dispose: () => {} };
  }

  // O Blob do React Native não aceita Uint8Array. O File do Expo implementa
  // bytes() para o multipart, usando um arquivo dentro do cache deste app.
  const extension = photo.mimeType === "image/png" ? "png" : "jpg";
  const file = new File(Paths.cache, `nota-fiscal-${photo.id}.${extension}`);
  file.create({ overwrite: true });
  try {
    await file.write(bytes);
  } catch (error) {
    file.delete();
    throw error;
  }
  return { blob: file, dispose: () => file.delete() };
}

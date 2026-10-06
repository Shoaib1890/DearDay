import * as FileSystem from 'expo-file-system/legacy';
import { Directory, File, Paths } from 'expo-file-system';

export async function persistPhoto(sourceUri: string, personId: string): Promise<string> {
  const avatars = new Directory(Paths.document, 'avatars');
  if (!avatars.exists) {
    avatars.create({ intermediates: true, idempotent: true });
  }

  const destination = new File(avatars, `${personId}.jpg`);
  if (destination.exists) {
    destination.delete();
  }

  await FileSystem.copyAsync({ from: sourceUri, to: destination.uri });
  return destination.uri;
}

export function deletePersistedPhoto(photoUri?: string): void {
  if (!photoUri) return;
  try {
    const file = new File(photoUri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('[DearDay] Could not delete photo', error);
  }
}

export function writeJsonFile(directory: Directory, name: string, contents: string): File {
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  const file = new File(directory, name);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(contents);
  return file;
}

import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Alert, Platform, Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';

/**
 * Solicita permisos para la cámara y galería
 */
export async function requestImagePermissions() {
  if (Platform.OS !== 'web') {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a la cámara y galería para subir fotos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Configuración', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openSettings();
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return false;
    }
  }
  return true;
}

/**
 * Muestra opciones para seleccionar imagen (cámara o galería)
 */
export function showImagePickerOptions(
  onSelectImage: (imageUri: string) => void,
  onCamera: () => void,
  onLibrary: () => void
) {
  Alert.alert(
    'Seleccionar foto',
    '¿Cómo quieres agregar la foto?',
    [
      { text: 'Cámara', onPress: onCamera },
      { text: 'Galería', onPress: onLibrary },
      { text: 'Cancelar', style: 'cancel' }
    ]
  );
}

/**
 * Abre la cámara para tomar una foto
 */
export async function takePhoto(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'No se pudo tomar la foto');
    return null;
  }
}

/**
 * Abre la galería para seleccionar una foto
 */
export async function pickImageFromLibrary(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'No se pudo seleccionar la imagen');
    return null;
  }
}

/**
 * Convierte la imagen a ArrayBuffer usando la nueva API de expo-file-system
 */
async function imageToArrayBuffer(imageUri: string): Promise<ArrayBuffer> {
  const file = new File(imageUri);
  const base64 = await file.base64();
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Sube una imagen a Supabase Storage
 */
export async function uploadImageToStorage(
  imageUri: string,
  bucketName: string = 'recipe-images',
  maxRetries: number = 3
): Promise<{ url: string | null; error: Error | null }> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const arrayBuffer = await imageToArrayBuffer(imageUri);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true,
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      return { url: publicUrl, error: null };
    } catch (error) {
      lastError = error as Error;
      console.error(`Upload attempt ${attempt}/${maxRetries} failed:`, lastError);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('Error uploading image after retries:', lastError);
  return { url: null, error: lastError };
}

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

// Upload multiple vehicle images
export async function uploadVehicleImages(
  vehicleId: string,
  images: File[]
): Promise<string[]> {
  if (!storage) throw new Error('Firebase Storage not configured');
  
  try {
    const uploadPromises = images.map(async (image, index) => {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${index}_${image.name}`;
      const storageRef = ref(storage!, `vehicles/${vehicleId}/${fileName}`);
      
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading vehicle images:', error);
    throw error;
  }
}

// Delete a single vehicle image
export async function deleteVehicleImage(imageUrl: string): Promise<void> {
  if (!storage) throw new Error('Firebase Storage not configured');
  
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid image URL format');
    }
    
    const imagePath = decodeURIComponent(pathMatch[1]);
    const imageRef = ref(storage!, imagePath);
    
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting vehicle image:', error);
    throw error;
  }
}

// Delete all images for a vehicle
export async function deleteAllVehicleImages(vehicleId: string): Promise<void> {
  if (!storage) throw new Error('Firebase Storage not configured');
  
  try {
    const folderRef = ref(storage!, `vehicles/${vehicleId}`);
    const result = await listAll(folderRef);
    
    const deletePromises = result.items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all vehicle images:', error);
    throw error;
  }
}

'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import Image from 'next/image';

interface ImageUploaderProps {
  images: File[];
  existingImageUrls?: string[];
  onChange: (files: File[]) => void;
  onRemoveExisting?: (url: string) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  existingImageUrls = [],
  onChange,
  onRemoveExisting,
  maxImages = 10,
}: ImageUploaderProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = images.length + existingImageUrls.length;
  const canAddMore = totalImages < maxImages;

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check if adding these files would exceed max
    const remainingSlots = maxImages - totalImages;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length < files.length) {
      alert(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s)`);
    }

    // Validate file types and sizes
    const validFiles = filesToAdd.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5 Mo)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);

    // Update parent component
    onChange([...images, ...validFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNew = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previewUrls];
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPreviewUrls(newPreviews);
    onChange(newImages);
  };

  const handleRemoveExisting = (url: string) => {
    if (onRemoveExisting) {
      onRemoveExisting(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canAddMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg cursor-pointer transition-colors"
          >
            <FiUpload className="w-5 h-5" />
            <span>Ajouter des images</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {totalImages} / {maxImages} images (max 5 Mo par image)
          </p>
        </div>
      )}

      {/* Image Grid */}
      {(existingImageUrls.length > 0 || previewUrls.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImageUrls.map((url, index) => (
            <div
              key={`existing-${index}`}
              className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(url)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Supprimer l'image"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* New Images (Previews) */}
          {previewUrls.map((url, index) => (
            <div
              key={`preview-${index}`}
              className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt={`Nouveau ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveNew(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer l'image"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {totalImages === 0 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <FiImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Aucune image ajoutée
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Cliquez sur &quot;Ajouter des images&quot; pour commencer
          </p>
        </div>
      )}
    </div>
  );
}

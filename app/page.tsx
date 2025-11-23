"use client";

import { useState } from "react";

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!imageFile) return;

    setIsUploading(true);
    setUploadedImageUrl(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.imagePath) {
        setUploadedImageUrl(data.imagePath);
      } else {
        console.error("Upload failed:", data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
      <main className="min-h-screen flex items-start justify-center bg-gray-50">
        <div className="w-full max-w-md p-4">
          <section className="p-4 border rounded bg-white shadow-sm">
            <h1 className="text-2xl font-semibold mb-4">Image Upload Demo</h1>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label
                    htmlFor="image"
                    className="block mb-1 font-medium text-gray-700"
                >
                  Select Image
                </label>
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded"
                    required
                />
              </div>

              {imagePreview && (
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Preview:</p>
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded border"
                    />
                  </div>
              )}

              <button
                  type="submit"
                  disabled={isUploading || !imageFile}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload image"}
              </button>
            </form>

            {uploadedImageUrl && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="font-medium text-green-800">
                    Image uploaded successfully
                  </p>

                  <div className="mt-2">
                    <img
                        src={uploadedImageUrl}
                        alt="Uploaded image"
                        className="max-h-60 rounded border"
                    />
                  </div>

                  <a
                      href={uploadedImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block mt-2 text-sm"
                  >
                    Open full image
                  </a>
                </div>
            )}
          </section>
        </div>
      </main>
  );
}
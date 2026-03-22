"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import {
  ensureVisionCompatibleImage,
  isHeicLike,
  isLikelyRasterImage,
} from "@/lib/heic-to-jpeg";

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export function ImageUploader({ onFileSelected, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!isLikelyRasterImage(file)) {
        setError("Please upload an image file (including iPhone HEIC / HEIF)");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be under 4MB");
        return;
      }

      let ready = file;
      if (isHeicLike(file)) {
        setConverting(true);
        try {
          ready = await ensureVisionCompatibleImage(file);
        } catch (e) {
          setConverting(false);
          setError(e instanceof Error ? e.message : "Could not convert this photo");
          return;
        }
        setConverting(false);
      }

      if (ready.size > MAX_SIZE) {
        setError("Converted image must be under 4MB — try a smaller photo");
        return;
      }

      const url = URL.createObjectURL(ready);
      setPreview(url);
      onFileSelected(ready);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clear = () => {
    setPreview(null);
    setError(null);
    setConverting(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-64 object-cover"
          />
          {!disabled && (
            <button
              onClick={clear}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !converting && !disabled && inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors duration-200
            ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }
            ${disabled || converting ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <div className="flex flex-col items-center gap-3">
            {converting ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : dragActive ? (
              <Upload className="w-10 h-10 text-primary" />
            ) : (
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {converting
                  ? "Converting HEIF / HEIC photo…"
                  : dragActive
                    ? "Drop your image here"
                    : "Upload a photo of any object"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG, WebP, or iPhone HEIC / HEIF. Max 4MB.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive mt-2 text-center">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        disabled={disabled || converting}
      />
    </div>
  );
}

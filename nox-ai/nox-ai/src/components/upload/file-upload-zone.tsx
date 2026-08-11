"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
}

export function FileUploadZone({
  onFiles,
  accept = {
    "application/pdf": [".pdf"],
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
  },
  maxSize = 15 * 1024 * 1024,
  multiple = true,
}: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50 hover:bg-secondary/30"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p className="font-medium mb-1">
        {isDragActive ? "Drop files here" : "Drag & drop or click to upload"}
      </p>
      <p className="text-sm text-muted-foreground">
        PDF, JPG, PNG, WEBP · Max 15 MB
      </p>
      <div className="flex justify-center gap-4 mt-4 text-muted-foreground">
        <FileText className="h-5 w-5" />
        <ImageIcon className="h-5 w-5" />
      </div>
    </div>
  );
}

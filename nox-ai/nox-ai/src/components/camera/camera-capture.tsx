"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, RotateCcw, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  const startCamera = async (mode: "environment" | "user" = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err.name === "NotAllowedError") {
        setError(
          "Camera permission is required to scan a question. Please allow camera access."
        );
      } else {
        setError(
          "Unable to access camera. You can upload an image from gallery instead."
        );
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    // stop stream after capture to save battery
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const retake = () => {
    setPreview(null);
    startCamera();
  };

  const usePhoto = () => {
    if (preview) onCapture(preview);
  };

  const switchCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  const onGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onCapture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white"
        >
          <X className="h-6 w-6" />
        </button>
        <span className="text-white font-medium">Scan Question</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center px-6 text-white">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">{error}</p>
            <label className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-3 cursor-pointer">
              <ImageIcon className="h-5 w-5" />
              Upload from Gallery
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onGallery}
              />
            </label>
          </div>
        ) : preview ? (
          <img
            src={preview}
            alt="Captured"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-h-full max-w-full object-contain camera-preview"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 flex items-center justify-center gap-6 safe-bottom">
        {preview ? (
          <>
            <button
              onClick={retake}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="h-6 w-6" />
              </div>
              <span className="text-xs">Retake</span>
            </button>
            <button
              onClick={usePhoto}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>
              <span className="text-xs">Use Photo</span>
            </button>
          </>
        ) : (
          <>
            <label className="flex flex-col items-center gap-1 text-white cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <ImageIcon className="h-5 w-5" />
              </div>
              <span className="text-xs">Gallery</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onGallery}
              />
            </label>
            <button
              onClick={capture}
              className="h-18 w-18 rounded-full border-4 border-white bg-white/30 flex items-center justify-center"
              style={{ height: 72, width: 72 }}
            >
              <div className="h-14 w-14 rounded-full bg-white" />
            </button>
            <button
              onClick={switchCamera}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="h-5 w-5" />
              </div>
              <span className="text-xs">Flip</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

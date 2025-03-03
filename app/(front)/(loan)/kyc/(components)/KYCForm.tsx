"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitKYCMutation } from "@/redux/appData";
import { toast } from "sonner";

export default function KYCForm({
  onSuccess,
}: {
  onSuccess: (data: any) => void;
}) {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [submitKYC, { isSuccess, data, isLoading, isError, error }] = useSubmitKYCMutation();

  // Request camera access when "isCapturing" becomes true
  useEffect(() => {
    if (isCapturing && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream; // Save stream reference
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();
        })
        .catch((err) => {
          console.error("❌ Camera access error:", err);
          alert("Failed to access camera. Please allow camera permissions.");
          setIsCapturing(false);
        });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop()); // Stop camera when component unmounts
      }
    };
  }, [isCapturing]);

  // Capture a selfie from webcam
  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setSelfie(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
            setIsCapturing(false);
          }
        }, "image/jpeg");
      }
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  // Submit KYC
  const handleSubmit = async () => {
    if (!idFile || !selfie) return alert("Both ID and Selfie are required.");

    const formData = new FormData();
    formData.append("file", idFile);
    formData.append("face", selfie);

    const response = await submitKYC(formData);
      console.log(response, "ff");

    if ("data" in response) {
      onSuccess(response.data);
    }
  };

    React.useEffect(() => {
      if (isSuccess) {
        console.log(data)
        toast.success("Action completed successfully! 🎉");
      }

      if (error) {
        console.log(error)
        // const errorMessage =
        //   errorMessages.length > 0
        //     ? errorMessages[0]
        //     : "An unexpected error occurred.";
        // toast.error(errorMessage);
      }
    }, [isSuccess,error, isError, data]);
  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4'>KYC Verification</h2>

      {/* File Upload */}
      <div className='mb-4'>
        <label className='block font-medium'>Upload ID Document</label>
        <Input type='file' accept='image/*' onChange={handleFileChange} />
      </div>

      {/* Camera Capture */}
      <div className='mb-4'>
        <label className='block font-medium'>Take a Selfie</label>
        {isCapturing ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              className='w-full h-48 rounded-md'
            ></video>
            <Button onClick={captureSelfie} className='mt-2'>
              Capture
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsCapturing(true)}>Open Camera</Button>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className='w-full mt-4'
      >
        {isLoading ? "Verifying..." : "Submit KYC"}
      </Button>

      {/* Error Message */}
      {isError && (
        <p className='text-red-500 mt-2'>
          {(error as any)?.data?.error || "Verification failed"}
        </p>
      )}
    </div>
  );
}

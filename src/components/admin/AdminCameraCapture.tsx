import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RotateCw,
  Check,
  X,
  Upload,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface AdminCameraCaptureProps {
  currentLang: Language;
  onPhotosCaptured: (images: string[]) => void;
  onAiSuggest?: (suggestedData: {
    nameUz: string;
    nameRu: string;
    nameEn: string;
    category: string;
    price: number;
    description: string;
  }) => void;
}

export const AdminCameraCapture: React.FC<AdminCameraCaptureProps> = ({
  currentLang,
  onPhotosCaptured,
  onAiSuggest,
}) => {
  const t = translations[currentLang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera ushbu brauzerda qo\'llab-quvvatlanmaydi.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // prefer back camera on phones
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.message || 'Kameraga ruxsat berilmadi yoki qurilma kamerasi topilmadi.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    // Attempt to start camera automatically when tab mounts
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Take Snapshot from video stream
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setCapturedPhotos((prev) => [...prev, dataUrl]);
    setSelectedPhotoIndex(capturedPhotos.length);
  };

  // Rotate selected photo in memory using hidden canvas
  const handleRotateCurrent = () => {
    if (selectedPhotoIndex === null || !capturedPhotos[selectedPhotoIndex]) return;

    const currentImgUrl = capturedPhotos[selectedPhotoIndex];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 90 degree clockwise rotation swaps width and height
      canvas.width = img.height;
      canvas.height = img.width;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhotos((prev) => {
        const next = [...prev];
        next[selectedPhotoIndex] = rotatedDataUrl;
        return next;
      });
    };
  };

  // Handle local file fallback if user prefers uploading or camera is blocked
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Delete captured photo
  const handleDeletePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
    if (selectedPhotoIndex === index) {
      setSelectedPhotoIndex(null);
    }
  };

  // AI Suggest from photos
  const handleAiAutoFill = () => {
    setIsAnalyzingAi(true);
    setTimeout(() => {
      setIsAnalyzingAi(false);
      if (onAiSuggest) {
        onAiSuggest({
          nameUz: 'Smart Ultra HD 4K Portativ Proyektor',
          nameRu: 'Смарт Ultra HD 4K Портативный проектор',
          nameEn: 'Smart Ultra HD 4K Portable Cinema Projector',
          category: 'cat-electronics',
          price: 2450000,
          description:
            'Kamera orqali yuklangan surat asosida avtomatik yaratildi. Yuqori yorug\'lik, 120Hz yangilanish va Android TV operatsion tizimi.',
        });
      }
    }, 1200);
  };

  // Confirm and push to parent product gallery
  const handleApplyToGallery = () => {
    if (capturedPhotos.length > 0) {
      onPhotosCaptured(capturedPhotos);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
        <Camera className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300 space-y-1">
          <p className="font-bold text-stone-100">
            Kamera orqali tezkor mahsulot suratga olish (Webcam & Mobile Camera)
          </p>
          <p className="text-stone-400 leading-relaxed">
            {t.cameraInstruction} Ketma-ket bir nechta surat olib, mahsulot rasmlar galereyasini
            bir urinishda shakllantirishingiz mumkin.
          </p>
        </div>
      </div>

      {/* Main Viewport Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Live Camera Stream Box */}
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 aspect-4/3 flex flex-col justify-between shadow-lg">
          {/* Shutter visual flash effect */}
          {isShutterFlashing && (
            <div className="absolute inset-0 bg-white z-30 pointer-events-none animate-out fade-out duration-200" />
          )}

          {/* Video Stream Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Fallback if camera error / inactive */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-stone-900 text-stone-400">
              <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs text-stone-300 max-w-xs">
                {cameraError || 'Kamera stream hozirda nofaol.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition"
                >
                  {t.startCamera}
                </button>
                <label className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-200 font-bold text-xs hover:bg-stone-700 transition cursor-pointer flex items-center gap-1.5 border border-stone-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Fayldan yuklash</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Camera controls overlay bar */}
          {cameraActive && (
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-stone-950/90 to-transparent flex items-center justify-between z-20">
              <button
                type="button"
                onClick={stopCamera}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs transition"
                title={t.stopCamera}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={takeSnapshot}
                className="w-14 h-14 rounded-full bg-white border-4 border-amber-500 flex items-center justify-center shadow-2xl active:scale-90 hover:scale-105 transition-transform"
                title={t.takePhoto}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500" />
              </button>

              {/* Upload fallback button */}
              <label
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs transition cursor-pointer"
                title="Fayl tanlash"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Right: Captured Photos Preview & Editing Section */}
        <div className="space-y-4 bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Olingan suratlar ({capturedPhotos.length})
            </span>
            {capturedPhotos.length > 0 && (
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={isAnalyzingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/30 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAnalyzingAi ? 'Tahlil qilinmoqda...' : t.aiSuggestInfo}</span>
              </button>
            )}
          </div>

          {/* Active Photo Full Preview */}
          {selectedPhotoIndex !== null && capturedPhotos[selectedPhotoIndex] ? (
            <div className="space-y-2">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                <img
                  src={capturedPhotos[selectedPhotoIndex]}
                  alt="Snapshot"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleRotateCurrent}
                    className="p-2 rounded-lg bg-stone-900/80 text-white hover:bg-stone-800 transition shadow-md"
                    title={t.rotatePhoto}
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(selectedPhotoIndex)}
                    className="p-2 rounded-lg bg-rose-600/80 text-white hover:bg-rose-700 transition shadow-md"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-4/3 rounded-xl border border-dashed border-stone-800 flex flex-col items-center justify-center text-center p-4 text-stone-500 text-xs space-y-2">
              <Camera className="w-8 h-8 text-stone-700" />
              <p>Suratga olingan yoki yuklangan tasvirlar shu yerda paydo bo'ladi</p>
            </div>
          )}

          {/* Thumbnails Row */}
          {capturedPhotos.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {capturedPhotos.map((photo, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPhotoIndex(i)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition ${
                    selectedPhotoIndex === i
                      ? 'border-amber-500 scale-105'
                      : 'border-stone-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Apply to Product Gallery Button */}
          {capturedPhotos.length > 0 && (
            <button
              type="button"
              onClick={handleApplyToGallery}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{t.addPhotoToGallery} ({capturedPhotos.length} ta surat)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

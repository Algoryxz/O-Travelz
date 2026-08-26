import React, { useRef } from 'react';

interface ImageIdentifyButtonProps {
  onImageSelected: (base64Data: string, fileName: string) => void;
  disabled?: boolean;
}

export const ImageIdentifyButton: React.FC<ImageIdentifyButtonProps> = ({
  onImageSelected,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onImageSelected(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Upload destination photo for visual recognition"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        data-testid="search-bar-image-scan-btn"
        title="Scan / Upload Image — Identify Odisha destinations from a photo"
        className="relative group p-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E5DFD5] hover:border-[#B87B22]/60 text-[#3D4654] hover:text-[#B87B22] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
        aria-label="Scan or upload image to find place"
      >
        <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
          photo_camera
        </span>

        {/* Hover Tooltip */}
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 bg-[#12161E] text-white text-[10px] font-mono py-1 px-2 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30">
          Scan / Upload Image
        </span>
      </button>
    </>
  );
};

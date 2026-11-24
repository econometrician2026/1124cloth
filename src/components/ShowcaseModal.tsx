import React from 'react';
import { Download, Play, X } from 'lucide-react';

interface ShowcaseModalProps {
  open: boolean;
  onClose: () => void;
  onStartLiveDemo: () => void;
}

export const ShowcaseModal: React.FC<ShowcaseModalProps> = ({
  open,
  onClose,
  onStartLiveDemo,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VESTIA Showcase Film"
      className="absolute inset-0 z-[120] bg-[#181715]/60 flex items-center justify-center p-10"
    >
      <div className="w-[1060px] bg-[#F6F4EF] border border-[#181715]/15 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#181715]/10">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8B857C]">
              16-Second Deterministic Capture · 30 fps
            </span>
            <h2 className="font-editorial text-[32px] leading-tight font-medium text-[#181715]">
              VESTIA Showcase Film
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close showcase modal"
            className="p-2 bg-white border border-[#181715]/12 text-[#5C5852] hover:text-[#181715] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-8 bg-[#EFECE5]">
          <div className="w-full aspect-video bg-[#181715] overflow-hidden border border-[#181715]/15">
            <video
              src="/vestia_showcase.mp4"
              controls
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support video playback.
            </video>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-[13px] text-[#5C5852]">
              Scripted sequence: Swap skirt · Swap top · Add bag · Swap bag ·
              Apply complete look · Swap bag · Shop the look.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartLiveDemo();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#181715]/20 text-[12px] font-semibold tracking-[0.08em] uppercase text-[#181715] hover:border-[#181715] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Replay Live Demo</span>
              </button>
              <a
                href="/vestia_showcase.mp4"
                download="vestia_showcase.mp4"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#181715] text-[#F6F4EF] text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-[#2C2A26]"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Download MP4</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

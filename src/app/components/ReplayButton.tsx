import React from 'react';

/** Large speaker button: replays the narrator's last line. No text for the child. */
export const ReplayButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    type="button"
    id="replay-prompt-btn"
    onClick={onClick}
    aria-label="Hear it again"
    className="cursor-pointer bg-white/95 hover:bg-white text-amber-900 w-14 h-14 rounded-full shadow-md border-2 border-b-[5px] border-amber-400 flex items-center justify-center active:translate-y-0.5 active:border-b-2 transition-transform"
  >
    <svg viewBox="0 0 24 24" className="w-8 h-8" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </button>
);

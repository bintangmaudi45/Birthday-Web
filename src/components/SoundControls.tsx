import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { useSound } from '@/state/SoundContext';

export default function SoundControls() {
  const { sfxEnabled, musicEnabled, toggleSfx, toggleMusic } = useSound();

  return (
    <div className="fixed right-4 top-4 z-[200] flex flex-col gap-2">
      <button
        onClick={toggleSfx}
        aria-label={sfxEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-sm transition-all duration-300 active:scale-90"
        style={{ touchAction: 'manipulation' }}
      >
        {sfxEnabled ? (
          <Volume2 size={15} className="text-white/70" />
        ) : (
          <VolumeX size={15} className="text-white/30" />
        )}
      </button>
      <button
        onClick={toggleMusic}
        aria-label={musicEnabled ? 'Mute music' : 'Unmute music'}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-sm transition-all duration-300 active:scale-90"
        style={{ touchAction: 'manipulation' }}
      >
        {musicEnabled ? (
          <Music2 size={15} className="text-white/70" />
        ) : (
          <Music size={15} className="text-white/30" />
        )}
      </button>
    </div>
  );
}

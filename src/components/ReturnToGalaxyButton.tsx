import { ArrowLeft } from 'lucide-react';
import { useSound } from '@/state/SoundContext';

interface Props {
  onReturn: () => void;
}

export default function ReturnToGalaxyButton({ onReturn }: Props) {
  const { play } = useSound();
  return (
    <button
      onClick={() => { play('buttonClick'); onReturn(); }}
      className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 select-none"
      style={{ touchAction: 'manipulation' }}
      aria-label="Return to galaxy"
    >
      <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 backdrop-blur-sm transition-all duration-300 active:scale-95 active:border-white/30">
        <ArrowLeft size={14} className="text-white/60" />
        <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-white/60">
          return to galaxy
        </span>
      </span>
    </button>
  );
}

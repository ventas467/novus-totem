import React from 'react';
import { motion } from 'framer-motion';
import PixelChicken from './PixelChicken';
import { playSound, toggleMute, getMuteState } from '../utils/audio';
import { Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';

export default function Welcome({ onStart, onOpenAdmin }) {
  const [muted, setMuted] = React.useState(getMuteState());

  const handleAudioToggle = (e) => {
    e.stopPropagation();
    const newState = toggleMute();
    setMuted(newState);
    if (!newState) playSound('click');
  };

  const handleStart = () => {
    playSound('jump');
    onStart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center justify-between h-full w-full p-8 md:p-12 bg-gradient-to-b from-novus-dark via-novus to-novus-dark overflow-hidden scanlines"
    >
      {/* Botón Discreto de Admin (Esquina Superior Derecha) */}
      <button
        onClick={onOpenAdmin}
        className="absolute top-4 right-4 z-50 p-3 bg-novus-dark/40 border-2 border-novus-light/30 rounded text-xs text-novus-light/50 hover:text-white hover:border-white transition-all active:scale-95"
        title="Acceso Administración Stand"
      >
        <ShieldAlert className="w-5 h-5" />
      </button>

      {/* Botón de Sonido Mute/Unmute (Esquina Superior Izquierda) */}
      <button
        onClick={handleAudioToggle}
        className="absolute top-4 left-4 z-50 p-3 bg-black/40 border-2 border-novus-gold/60 text-novus-gold flex items-center gap-2 text-xs rounded active:scale-95 shadow-pixel"
      >
        {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
        <span>{muted ? 'MUTED' : 'AUDIO ON'}</span>
      </button>

      {/* Header & Logo NOVUS Retro Arcade */}
      <div className="flex flex-col items-center space-y-4 mt-6 text-center z-10">
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="bg-black/60 p-4 border-4 border-novus-gold shadow-pixel-lg rounded-sm"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-novus-gold text-2xl md:text-3xl font-black">★</span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider text-white drop-shadow-[0_4px_0_#1C5274]">
              NOVUS
            </h1>
            <span className="text-novus-gold text-2xl md:text-3xl font-black">★</span>
          </div>
          <div className="text-[10px] md:text-xs text-novus-gold tracking-widest mt-2 uppercase font-mono">
            Soluciones para Salud y Producción Avícola
          </div>
        </motion.div>

        {/* Marquee Título del Juego */}
        <div className="bg-novus p-3 border-4 border-white shadow-pixel text-yellow-300 text-sm md:text-xl tracking-wider font-pixel uppercase mt-2 animate-pulse">
          🎮 TRIVIA DESAFÍO AVÍCOLA 8-BITS 🎮
        </div>
      </div>

      {/* Área Central: Pollo Pixel Art Animado & Gráficos de Granja */}
      <div className="relative flex flex-col items-center justify-center my-4 z-10">
        {/* Nubes Retro flotantes */}
        <motion.div
          animate={{ x: [-150, 150] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="absolute -top-12 text-white/30 text-3xl select-none pointer-events-none"
        >
          ☁️ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☁️
        </motion.div>

        {/* Círculo de Luz/Enfoque de Stand */}
        <div className="relative p-8 bg-novus-light/20 rounded-full border-4 border-dashed border-novus-gold/40 flex items-center justify-center">
          <PixelChicken state="celebrate" size="large" />
        </div>

        {/* Banner de mensaje explicativo */}
        <div className="mt-4 px-6 py-2 bg-black/70 border-2 border-novus-light text-center text-xs text-slate-200 max-w-lg shadow-pixel">
          Demuestra tus conocimientos en nutrición, biquelados y salud intestinal. ¡Compite por el primer lugar!
        </div>
      </div>

      {/* Botón Táctil Gigante "TOCAR PARA JUGAR" */}
      <div className="w-full max-w-md flex flex-col items-center z-10 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={handleStart}
          className="w-full py-6 md:py-8 bg-novus-gold hover:bg-yellow-400 text-novus-dark font-black text-xl md:text-2xl tracking-widest pixel-button border-4 border-black text-center shadow-pixel-lg uppercase flex items-center justify-center gap-3"
        >
          <Sparkles className="w-8 h-8 animate-spin" />
          <span>TOCAR PARA JUGAR</span>
          <Sparkles className="w-8 h-8 animate-spin" />
        </motion.button>
        <div className="text-[10px] text-novus-gold/80 mt-3 animate-pulse">
          ▼ PRESIONA EN CUALQUIER PARTE PARA INICIAR ▼
        </div>
      </div>

      {/* Footer corporativo */}
      <div className="text-[9px] text-slate-400 z-10 text-center tracking-widest">
        NOVUS INTERNATIONAL © 2026 • TÓTEM TÁCTIL FÍSICO
      </div>
    </motion.div>
  );
}

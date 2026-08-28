import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PixelChicken from './PixelChicken';
import NovusPixelLogo from './NovusPixelLogo';
import { playSound, toggleMute, getMuteState } from '../utils/audio';
import { Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';

export default function Welcome({ onStart, onOpenAdmin }) {
  const [muted, setMuted] = useState(getMuteState());

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
    <div className="relative flex flex-col items-center justify-between h-full w-full p-4 md:p-8 bg-gradient-to-b from-novus-dark via-novus to-novus-dark overflow-hidden scanlines hardware-accel">
      {/* Botón Discreto de Admin (Esquina Superior Derecha) */}
      <button
        onClick={onOpenAdmin}
        className="absolute top-4 right-4 z-50 p-3 bg-novus-dark/60 border-2 border-novus-light/40 rounded text-xs text-novus-light hover:text-white transition-all active:scale-95 shadow-pixel"
        title="Acceso Administración Stand"
      >
        <ShieldAlert className="w-5 h-5" />
      </button>

      {/* Botón de Sonido Mute/Unmute (Esquina Superior Izquierda) */}
      <button
        onClick={handleAudioToggle}
        className="absolute top-4 left-4 z-50 p-3 bg-black/60 border-2 border-yellow-400 text-yellow-400 flex items-center gap-2 text-xs rounded active:scale-95 shadow-pixel"
      >
        {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
        <span>{muted ? 'MUTED' : 'AUDIO ON'}</span>
      </button>

      {/* HEADER & LOGO CORPORATIVO ORIGINAL NOVUS (OPTIMIZADO Z-100) */}
      <div className="flex flex-col items-center space-y-3 mt-2 text-center z-[100] relative w-full max-w-xl hardware-accel">
        <div className="w-full bg-[#1C5274] px-5 py-4 border-4 border-yellow-400 shadow-pixel-lg rounded-md flex flex-col items-center justify-center relative z-[100]">
          {/* Logo Blanco Transparente HD de NOVUS */}
          <NovusPixelLogo showTagline={false} />

          {/* Tagline Corporativo Novus */}
          <div className="text-[10px] md:text-xs text-yellow-300 tracking-widest mt-2 uppercase font-pixel border-t-2 border-novus-light/60 pt-2 w-full text-center font-bold">
            SOLUCIONES PARA SALUD Y PRODUCCIÓN AVÍCOLA
          </div>
        </div>

        {/* Marquee Título del Juego */}
        <div className="bg-novus p-3 border-4 border-white shadow-pixel text-yellow-300 text-xs md:text-sm tracking-wider font-pixel uppercase">
          🎮 TRIVIA DESAFÍO AVÍCOLA 8-BITS 🎮
        </div>
      </div>

      {/* Área Central: Pollo Pixel Art Animado & Gráficos de Granja */}
      <div className="relative flex flex-col items-center justify-center my-2 z-10 hardware-accel">
        {/* Nubes Retro flotantes con aceleración CSS */}
        <div className="absolute -top-10 text-white/30 text-2xl select-none pointer-events-none animate-clouds-fast">
          ☁️ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ☁️
        </div>

        {/* Círculo de Enfoque */}
        <div className="relative p-5 bg-novus-light/20 rounded-full border-4 border-dashed border-yellow-400/40 flex items-center justify-center shadow-pixel">
          <PixelChicken state="celebrate" size="large" />
        </div>

        {/* Banner Explicativo */}
        <div className="mt-3 px-6 py-2 bg-black/80 border-2 border-novus-light text-center text-[11px] text-slate-200 max-w-lg shadow-pixel">
          Demuestra tus conocimientos en nutrición, biquelados y salud intestinal. ¡Compite por el primer lugar!
        </div>
      </div>

      {/* Botón Táctil Gigante "TOCAR PARA JUGAR" */}
      <div className="w-full max-w-md flex flex-col items-center z-10 mb-2 hardware-accel">
        <button
          onClick={handleStart}
          className="w-full py-5 md:py-6 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg md:text-xl tracking-widest pixel-button border-4 border-black text-center shadow-pixel-lg uppercase flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <Sparkles className="w-6 h-6 animate-spin" />
          <span>TOCAR PARA JUGAR</span>
          <Sparkles className="w-6 h-6 animate-spin" />
        </button>
        <div className="text-[10px] text-yellow-400 mt-2 font-pixel">
          ▼ PRESIONA PARA INICIAR ▼
        </div>
      </div>

      {/* Footer corporativo */}
      <div className="text-[9px] text-slate-400 z-10 text-center tracking-widest">
        NOVUS INTERNATIONAL © 2026 • TÓTEM TÁCTIL FÍSICO
      </div>
    </div>
  );
}

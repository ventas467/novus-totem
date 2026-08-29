import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PixelChicken from './PixelChicken';
import { playSound } from '../utils/audio';
import { Trophy, RotateCcw, HeartHandshake } from 'lucide-react';

export default function EndScreen({ score, totalQuestions = 3, currentLead, onReset }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Reproducir sonido de victoria al cargar
    if (score >= 2) {
      playSound('victory');
    } else {
      playSound('correct');
    }

    // Intervalo de 10 segundos para autorreiniciar
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        playSound('tick');
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [score, onReset]);

  // Título y badge según puntaje
  let rankTitle = "¡BUEN INTENTO!";
  let badgeColor = "text-yellow-400";
  let chickenState = "idle";

  if (score === totalQuestions) {
    rankTitle = "¡MAESTRO AVÍCOLA NOVUS! 🏆";
    badgeColor = "text-yellow-300";
    chickenState = "celebrate";
  } else if (score >= totalQuestions - 1) {
    rankTitle = "¡EXPERTO EN NUTRICIÓN Y SALUD! ⭐";
    badgeColor = "text-green-400";
    chickenState = "jumping";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-between h-full w-full p-6 md:p-10 bg-gradient-to-b from-novus-dark via-novus to-novus-dark scanlines overflow-hidden"
    >
      {/* Top Banner */}
      <div className="w-full text-center z-10">
        <div className="inline-block bg-black/60 px-6 py-2 border-2 border-novus-gold text-novus-gold text-xs font-mono tracking-widest uppercase">
          ¡TRIVIA FINALIZADA!
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-xl bg-novus p-6 md:p-8 border-4 border-white shadow-pixel-lg z-10 flex flex-col items-center space-y-6 text-center">
        {/* Pollo Animado */}
        <div className="relative">
          <PixelChicken state={chickenState} size="large" />
        </div>

        {/* Título de Rango */}
        <div>
          <h1 className={`text-xl md:text-2xl font-black ${badgeColor} tracking-wide uppercase mb-1`}>
            {rankTitle}
          </h1>
          <p className="text-xs text-slate-200">
            ¡Muchas gracias por participar, <span className="text-novus-gold font-bold">{currentLead?.name || 'Visitante'}</span>!
          </p>
        </div>

        {/* Cesta de Puntaje */}
        <div className="w-full bg-black/70 p-4 border-4 border-novus-gold flex flex-col items-center justify-center space-y-2">
          <div className="text-xs text-slate-300">TU PUNTAJE FINAL:</div>
          <div className="text-4xl md:text-6xl font-black text-novus-gold drop-shadow-[0_4px_0_#000]">
            {score} / {totalQuestions}
          </div>
          <div className="text-[10px] text-green-400 font-mono">
            {Math.round((score / totalQuestions) * 100)}% DE PRECISIÓN
          </div>
        </div>

        {/* Mensaje Informativo NOVUS (Actualizado según Slide 4 del PPTX) */}
        <div className="text-xs md:text-sm font-bold text-slate-100 leading-relaxed bg-black/90 p-4 border-2 border-yellow-400 shadow-pixel font-mono">
          <HeartHandshake className="w-6 h-6 text-yellow-400 mx-auto mb-2 animate-bounce" />
          Acércate al equipo NOVUS para conocer más sobre nuestras soluciones para avicultura.
        </div>
      </div>

      {/* Auto Reset Bar & Button */}
      <div className="w-full max-w-xl z-10 flex flex-col items-center space-y-4">
        {/* Visual Progress Bar de 10 segundos */}
        <div className="w-full bg-black/60 p-2 border-2 border-novus-light flex flex-col space-y-1">
          <div className="flex justify-between text-[10px] text-novus-gold font-mono px-1">
            <span>REINICIANDO PARA EL SIGUIENTE JUGADOR...</span>
            <span>{countdown}s</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-none overflow-hidden border border-slate-600">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(countdown / 10) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
              className="h-full bg-novus-gold"
            />
          </div>
        </div>

        {/* Giant Quick Touch Button to play immediately */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playSound('click'); onReset(); }}
          className="w-full py-4 bg-novus-gold hover:bg-yellow-400 text-novus-dark font-black text-base md:text-lg tracking-wider border-4 border-black shadow-pixel uppercase flex items-center justify-center gap-3 pixel-button"
        >
          <RotateCcw className="w-6 h-6 animate-spin" />
          <span>¡NUEVO JUGADOR / REINICIAR AHORA!</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

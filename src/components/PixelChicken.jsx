import React from 'react';
import { motion } from 'framer-motion';

export default function PixelChicken({ state = 'idle', size = 'normal' }) {
  // Configuración de tamaño
  const dimensions = size === 'large' ? 'w-32 h-32' : size === 'small' ? 'w-16 h-16' : 'w-24 h-24';

  return (
    <div className={`relative ${dimensions} flex items-center justify-center`}>
      {/* Sombra Pixel en el suelo */}
      <motion.div
        animate={{
          scaleX: state === 'jumping' ? 0.4 : state === 'celebrate' ? [1, 1.2, 1] : 1,
          opacity: state === 'jumping' ? 0.3 : 0.6,
        }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 w-3/4 h-2 bg-black opacity-50 rounded-full blur-[1px]"
      />

      {/* Cuerpo del Pollo Pixel Art Renderizado por SVG Rectángulos 8-Bits */}
      <motion.div
        animate={
          state === 'jumping'
            ? { y: -70, rotate: -8 }
            : state === 'celebrate'
            ? { y: [-4, -20, -4], rotate: [0, 10, -10, 0] }
            : state === 'sad'
            ? { y: 2, rotate: 15 }
            : { y: [0, -6, 0] } // idle
        }
        transition={
          state === 'jumping'
            ? { type: 'spring', stiffness: 350, damping: 15 }
            : state === 'celebrate'
            ? { repeat: Infinity, duration: 0.6 }
            : state === 'idle'
            ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
        className="relative w-full h-full"
      >
        <svg viewBox="0 0 16 16" className="w-full h-full shape-rendering-crisp" style={{ imageRendering: 'pixelated' }}>
          {/* Cresta Roja */}
          <rect x="7" y="1" width="3" height="2" fill="#EF4444" />
          <rect x="9" y="0" width="2" height="2" fill="#DC2626" />

          {/* Cabeza y Cuerpo Blanco */}
          <rect x="5" y="3" width="7" height="4" fill="#FFFFFF" />
          <rect x="4" y="6" width="9" height="6" fill="#F8FAFC" />
          <rect x="3" y="8" width="10" height="4" fill="#E2E8F0" />

          {/* Ojo Pixel (Negro + Brillo Blanco) */}
          {state === 'sad' ? (
            // Ojo Triste (X)
            <>
              <rect x="9" y="4" width="1" height="1" fill="#000000" />
              <rect x="11" y="4" width="1" height="1" fill="#000000" />
              <rect x="10" y="5" width="1" height="1" fill="#000000" />
            </>
          ) : (
            // Ojo Normal / Felíz
            <>
              <rect x="9" y="4" width="2" height="2" fill="#000000" />
              <rect x="9" y="4" width="1" height="1" fill="#FFFFFF" />
            </>
          )}

          {/* Pico Amarillo / Naranja */}
          <rect x="11" y="5" width="4" height="2" fill="#F59E0B" />
          <rect x="12" y="7" width="2" height="1" fill="#D97706" />

          {/* Barba Roja */}
          <rect x="10" y="7" width="2" height="2" fill="#EF4444" />

          {/* Ala Pixelada (Animada si está celebrando) */}
          <motion.g
            animate={state === 'celebrate' ? { y: [-1, 1, -1] } : {}}
            transition={{ repeat: Infinity, duration: 0.2 }}
          >
            <rect x="5" y="7" width="4" height="4" fill="#CBD5E1" />
            <rect x="4" y="8" width="4" height="2" fill="#94A3B8" />
          </motion.g>

          {/* Patas y Flecos */}
          {state === 'jumping' ? (
            // Patas encogidas en el aire
            <>
              <rect x="5" y="12" width="2" height="2" fill="#F59E0B" />
              <rect x="9" y="12" width="2" height="2" fill="#F59E0B" />
            </>
          ) : (
            // Patas de pie
            <>
              <rect x="6" y="12" width="1" height="3" fill="#F59E0B" />
              <rect x="5" y="14" width="3" height="1" fill="#D97706" />

              <rect x="9" y="12" width="1" height="3" fill="#F59E0B" />
              <rect x="8" y="14" width="3" height="1" fill="#D97706" />
            </>
          )}
        </svg>

        {/* Estrellitas Retro en estado de Celebración */}
        {state === 'celebrate' && (
          <>
            <motion.div
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: [0, 1.2, 0], y: -20, x: -15 }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }}
              className="absolute -top-2 left-0 text-yellow-400 text-xs font-bold"
            >
              ★
            </motion.div>
            <motion.div
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: [0, 1.4, 0], y: -25, x: 20 }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
              className="absolute -top-4 right-0 text-yellow-300 text-xs font-bold"
            >
              ✦
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}

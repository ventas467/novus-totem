import React from 'react';

export default function NovusPixelLogo({ className = '', showTagline = false }) {
  return (
    <div className={`flex flex-col items-center justify-center p-2 select-none ${className}`}>
      {/* LOGO VECTORIAL OFICIAL DE NOVUS (PUBLIC/NOVUSLOGOVECTOR.SVG) */}
      <img
        src="/novuslogovector.svg"
        alt="NOVUS International Logo Oficial"
        className="h-16 md:h-24 w-auto max-w-lg object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
      />

      {showTagline && (
        <div className="mt-3 text-center">
          <p className="text-yellow-400 font-pixel text-[10px] md:text-xs tracking-widest uppercase drop-shadow-[0_2px_0_#000]">
            SOLUCIONES PARA SALUD Y PRODUCCIÓN AVÍCOLA
          </p>
        </div>
      )}
    </div>
  );
}

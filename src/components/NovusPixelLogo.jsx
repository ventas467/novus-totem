import React from 'react';

export default function NovusPixelLogo({ className = '', showTagline = false }) {
  return (
    <div className={`flex flex-col items-center justify-center p-2 select-none hardware-accel ${className}`}>
      {/* LOGO VECTORIAL HD OPTIMIZADO PARA MALI-G31 GPU / FIREFOX ARM */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 560 100"
        className="h-14 md:h-20 w-auto max-w-lg object-contain transition-transform duration-200"
        fill="none"
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        {/* N */}
        <path d="M 10 12 H 36 L 76 72 V 12 H 98 V 90 H 72 L 32 30 V 90 H 10 Z" fill="#FFFFFF"/>
        
        {/* O: Emblemático Doble Espiral / Doble Creciente Corporativo Oficial Novus */}
        <g transform="translate(108, 6)">
          <path d="M 45 4 C 18 4 0 24 0 50 C 0 76 20 94 47 94 C 70 94 88 77 90 54 H 74 C 72 67 61 78 47 78 C 30 78 16 64 16 50 C 16 35 30 20 45 20 C 51 20 57 22 62 25 L 72 13 C 64 7 55 4 45 4 Z" fill="#FFFFFF"/>
          <path d="M 45 28 C 33 28 24 38 24 50 C 24 61 33 70 45 70 C 56 70 65 61 65 50 C 65 44 62 39 57 35 L 68 24 C 76 31 81 40 81 50 C 81 70 65 86 45 86 C 25 86 9 70 9 50 C 9 30 25 14 45 14 C 54 14 63 17 70 23 L 60 33 C 55 30 50 28 45 28 Z" fill="#FFFFFF"/>
        </g>
        
        {/* V */}
        <path d="M 215 12 H 240 L 268 76 L 296 12 H 322 L 282 90 H 254 Z" fill="#FFFFFF"/>
        
        {/* U */}
        <path d="M 334 12 H 358 V 60 C 358 70 366 76 376 76 C 386 76 394 70 394 60 V 12 H 418 V 60 C 418 86 398 94 376 94 C 354 94 334 86 334 60 Z" fill="#FFFFFF"/>
        
        {/* S */}
        <path d="M 430 32 C 430 18 448 10 472 10 C 496 10 514 18 514 32 H 488 C 488 26 482 23 472 23 C 462 23 456 26 456 31 C 456 37 464 39 480 43 C 498 47 516 54 516 71 C 516 87 498 95 472 95 C 445 95 426 86 426 69 H 452 C 452 75 460 78 472 78 C 484 78 490 74 490 69 C 490 63 480 61 466 57 C 446 52 430 45 430 32 Z" fill="#FFFFFF"/>
      </svg>

      {showTagline && (
        <div className="mt-2 text-center">
          <p className="text-yellow-400 font-pixel text-[10px] md:text-xs tracking-widest uppercase">
            SOLUCIONES PARA SALUD Y PRODUCCIÓN AVÍCOLA
          </p>
        </div>
      )}
    </div>
  );
}

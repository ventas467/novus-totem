import React from 'react';
import { playSound } from '../utils/audio';
import { Delete, Check, Space, ChevronDown } from 'lucide-react';

const ROWS = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['Z','X','C','V','B','N','M','@','.','_'],
  ['BORRAR', 'ESPACIO', 'LISTO']
];

export default function VirtualKeyboard({ onKeyPress, activeInputLabel, currentValue = '', onClose }) {
  const handleKeyClick = (key) => {
    playSound('jump');
    if (key === 'LISTO' && onClose) {
      onClose();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="p-3 md:p-4 pb-6 flex flex-col gap-2.5 bg-slate-950 font-pixel select-none border-t-4 border-yellow-400 shadow-2xl w-full">
      {/* BARRA DE PREVISUALIZACIÓN DE TEXTO EN VIVO Y BOTÓN VISIBLE DE OCULTAR TECLADO */}
      <div className="w-full max-w-6xl mx-auto bg-black border-2 border-yellow-400 p-2 md:p-2.5 flex items-center justify-between gap-3 shadow-pixel">
        {activeInputLabel ? (
          <div className="text-[10px] md:text-xs text-yellow-400 font-mono uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
            <span>EDITANDO: <strong className="text-white px-2 py-0.5 bg-[#1C5274] border border-white font-bold">{activeInputLabel}</strong></span>
          </div>
        ) : (
          <div className="text-xs text-yellow-400 font-mono uppercase tracking-wider">
            TECLADO VIRTUAL RETRO
          </div>
        )}

        <div className="bg-slate-900 px-3 md:px-4 py-1 border border-slate-600 font-mono text-sm md:text-lg text-white font-black tracking-wider truncate flex-1 flex items-center justify-between mx-2">
          <span className="truncate">{currentValue || <span className="text-slate-500 font-normal text-xs italic">Escribiendo aquí...</span>}</span>
          <span className="animate-ping ml-1 text-yellow-400 font-black text-xl">_</span>
        </div>

        {/* BOTÓN VISIBLE PARA OCULTAR TECLADO */}
        {onClose && (
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[11px] md:text-xs px-3 py-1.5 border-2 border-white font-bold flex items-center gap-1 shadow-pixel uppercase flex-shrink-0 cursor-pointer"
            title="Ocultar Teclado"
          >
            <ChevronDown className="w-4 h-4 text-white animate-bounce" />
            <span>OCULTAR TECLADO</span>
          </button>
        )}
      </div>

      {/* TECLAS RETRO EXTENDIDAS AL ANCHO TOTAL DE LA PANTALLA */}
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-2 w-full max-w-6xl mx-auto px-1 md:px-4">
          {row.map(key => {
            let flexStyle = 'flex-1';
            let bgStyle = 'bg-[#1C5274] hover:bg-[#2A7BA0] text-white font-bold';
            let icon = null;

            if (key === 'ESPACIO') {
              flexStyle = 'flex-[4]';
              bgStyle = 'bg-slate-800 text-white font-bold';
              icon = <Space className="w-5 h-5 inline mr-1.5 text-yellow-400" />;
            } else if (key === 'BORRAR') {
              flexStyle = 'flex-[2]';
              bgStyle = 'bg-red-800 hover:bg-red-700 text-white font-bold';
              icon = <Delete className="w-5 h-5 inline mr-1.5 text-white" />;
            } else if (key === 'LISTO') {
              flexStyle = 'flex-[2]';
              bgStyle = 'bg-green-700 hover:bg-green-600 text-white font-bold';
              icon = <Check className="w-5 h-5 inline mr-1.5 text-white" />;
            }

            return (
              <button
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleKeyClick(key);
                }}
                className={`
                  h-14 md:h-16 border-b-4 border-black font-mono text-xs md:text-base font-extrabold
                  flex items-center justify-center transition-all active:border-b-0 active:translate-y-1
                  ${flexStyle} ${bgStyle} shadow-pixel rounded-sm
                `}
              >
                {icon}
                <span>{key}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

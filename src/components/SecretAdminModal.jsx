import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/audio';
import { Lock, X, Delete } from 'lucide-react';

export default function SecretAdminModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num) => {
    playSound('click');
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    playSound('click');
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (inputPin) => {
    if (inputPin === '1234') {
      playSound('admin');
      onSuccess();
    } else {
      playSound('error');
      setError(true);
      setTimeout(() => setPin(''), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 font-pixel">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-novus border-4 border-white p-6 w-full max-w-sm shadow-pixel-lg text-center space-y-6"
      >
        <div className="flex justify-between items-center border-b-2 border-novus-gold pb-3">
          <div className="flex items-center gap-2 text-novus-gold text-xs">
            <Lock className="w-4 h-4" /> PIN DE ADMINISTRADOR
          </div>
          <button onClick={onClose} className="text-white hover:text-red-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs text-slate-200 mb-4 uppercase font-bold">INGRESA EL CÓDIGO DE ACCESO</p>
          
          {/* Indicador PIN Enmascarado (4 Cajas) */}
          <div className="flex justify-center gap-3 my-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-10 h-12 border-4 flex items-center justify-center text-xl font-bold ${
                  error
                    ? 'border-red-500 bg-red-950 text-red-400 animate-shake'
                    : pin.length > i
                    ? 'border-yellow-400 bg-black text-yellow-400'
                    : 'border-slate-600 bg-novus-dark text-slate-500'
                }`}
              >
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>
          {error && <span className="text-[10px] text-red-400 block mt-1">PIN INCORRECTO</span>}
        </div>

        {/* Teclado Numérico Táctil */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="p-4 bg-novus-dark text-white border-2 border-novus-light hover:border-white font-bold text-lg pixel-button active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => { setPin(''); playSound('click'); }}
            className="p-4 bg-red-900 text-white border-2 border-red-500 text-xs font-bold active:scale-95 flex items-center justify-center"
          >
            C
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="p-4 bg-novus-dark text-white border-2 border-novus-light hover:border-white font-bold text-lg pixel-button active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="p-4 bg-slate-800 text-white border-2 border-slate-600 text-xs font-bold active:scale-95 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

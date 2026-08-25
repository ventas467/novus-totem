import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/audio';
import { User, Mail, Award, ArrowRight, ArrowLeft } from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: "Salud Intestinal", icon: "🌱", label: "Salud Intestinal" },
  { id: "Nutrición/Enzimas", icon: "🧪", label: "Nutrición / Enzimas" },
  { id: "Calidad de Cascarón", icon: "🥚", label: "Calidad de Cascarón" },
  { id: "Otro", icon: "🐓", label: "Otro Interés Avícola" }
];

export default function LeadForm({ onSubmit, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState(INTEREST_OPTIONS[0].id);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Ingresa tu nombre';
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Correo inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      playSound('error');
      return;
    }

    playSound('click');
    onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      interest: interest
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-between h-full w-full p-6 md:p-10 bg-novus-dark scanlines overflow-y-auto"
    >
      {/* Top Bar Navigation */}
      <div className="w-full flex items-center justify-between z-10 max-w-2xl">
        <button
          onClick={() => { playSound('click'); onBack(); }}
          className="flex items-center gap-2 bg-black/50 border-2 border-slate-400 text-slate-200 px-4 py-2 text-xs rounded hover:bg-slate-800 active:scale-95 shadow-pixel"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER
        </button>
        <div className="text-novus-gold text-xs font-mono tracking-widest bg-black/60 px-4 py-2 border border-novus-gold/40">
          PASO 1 DE 2: REGISTRO
        </div>
      </div>

      {/* Form Card Container */}
      <div className="w-full max-w-2xl my-4 z-10">
        <div className="bg-novus p-6 md:p-8 border-4 border-white shadow-pixel-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-novus-gold tracking-wide mb-2 uppercase">
              REGISTRO DE JUGADOR
            </h2>
            <p className="text-xs text-slate-200">
              Ingresa tus datos para registrar tu puntaje en el tablero NOVUS:
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo: Nombre Completo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-novus-gold" /> NOMBRE COMPLETO *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: null })); }}
                placeholder="Ej. Carlos Mendoza"
                className={`w-full text-sm md:text-base pixel-input ${errors.name ? 'border-red-500' : ''}`}
                autoComplete="off"
              />
              {errors.name && <span className="text-[10px] text-red-400 block">{errors.name}</span>}
            </div>

            {/* Campo: Correo Electrónico */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-novus-gold" /> CORREO ELECTRÓNICO *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })); }}
                placeholder="carlos@empresa.com"
                className={`w-full text-sm md:text-base pixel-input ${errors.email ? 'border-red-500' : ''}`}
                autoComplete="off"
              />
              {errors.email && <span className="text-[10px] text-red-400 block">{errors.email}</span>}
            </div>

            {/* Campo: Selector de Interés Principal */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-novus-gold" /> ÁREA DE INTERÉS PRINCIPAL
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setInterest(opt.id); playSound('click'); }}
                    className={`p-3 text-left border-4 text-xs font-mono transition-all flex items-center gap-2 ${
                      interest === opt.id
                        ? 'bg-novus-gold text-novus-dark border-white shadow-pixel font-bold scale-[1.02]'
                        : 'bg-novus-dark/80 text-slate-200 border-novus-light hover:border-white'
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Acción Comenzar */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black text-lg tracking-wider border-4 border-black shadow-pixel uppercase flex items-center justify-center gap-2 pixel-button"
              >
                <span>¡COMENZAR TRIVIA!</span>
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      {/* Touch keyboard note */}
      <div className="text-[10px] text-slate-400 z-10 text-center">
        TÓTEM TÁCTIL FÍSICO NOVUS • LOS DATOS PERMANECEN ALMACENADOS 100% LOCALMENTE
      </div>
    </motion.div>
  );
}

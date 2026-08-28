import React, { useState, useEffect, useRef } from 'react';
import { db, sanitizeDatabaseFormConfigAndLeads } from '../utils/db';
import VirtualKeyboard from './VirtualKeyboard';
import { playSound } from '../utils/audio';
import { ArrowLeft, Keyboard, ShieldCheck, Check } from 'lucide-react';

export default function LeadForm({ onSubmit, onBack }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const fieldRefs = useRef({});

  useEffect(() => {
    loadFormConfig();
  }, []);

  const loadFormConfig = async () => {
    try {
      let config = await db.formConfig.orderBy('order').toArray();
      
      if (!config || config.length !== 6) {
        await sanitizeDatabaseFormConfigAndLeads();
        config = await db.formConfig.orderBy('order').toArray();
      }

      // Deduplicación en el cliente por etiqueta
      const labelMap = new Map();
      config.forEach(f => {
        if (!labelMap.has(f.label)) {
          labelMap.set(f.label, f);
        }
      });
      const uniqueFields = Array.from(labelMap.values());
      setFields(uniqueFields);

      const initialData = {};
      uniqueFields.forEach(f => {
        if (f.type === 'select' && f.options) {
          const optList = f.options.split(',').map(o => o.trim()).filter(Boolean);
          initialData[f.label] = optList[0] || '';
        } else if (f.type === 'legal') {
          initialData[f.label] = false;
        } else {
          initialData[f.label] = '';
        }
      });
      setFormData(initialData);
    } catch (err) {
      console.error("Error cargando configuración del formulario:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (label, type) => {
    if (type === 'text' || type === 'email' || type === 'number') {
      setActiveField(label);
      setTimeout(() => {
        fieldRefs.current[label]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      playSound('jump');
    } else {
      setActiveField(null);
    }
  };

  const handleKeyPress = (key) => {
    if (!activeField) return;
    const current = formData[activeField] || "";

    if (key === 'BORRAR') {
      setFormData(prev => ({ ...prev, [activeField]: current.slice(0, -1) }));
    } else if (key === 'ESPACIO') {
      setFormData(prev => ({ ...prev, [activeField]: current + " " }));
    } else if (key === 'LISTO') {
      setActiveField(null);
    } else if (current.length < 35) {
      setFormData(prev => ({ ...prev, [activeField]: current + key }));
    }
    playSound('jump');
  };

  const canSubmit = fields.every(f => !f.required || Boolean(formData[f.label]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      playSound('error');
      alert("POR FAVOR COMPLETA TODOS LOS CAMPOS Y ACEPTA EL TRATAMIENTO DE DATOS.");
      return;
    }
    playSound('click');
    onSubmit(formData);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0F3249] text-white font-pixel">
        <div className="animate-spin text-4xl mb-4">📜</div>
        <p className="text-sm animate-pulse">CARGANDO FORMULARIO...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F3249] text-white font-pixel select-none overflow-hidden scanlines">
      {/* HEADER CABECERA DE ALTO CONTRASTE */}
      <div className="p-4 md:p-5 border-b-4 border-yellow-400 bg-black/80 shadow-xl z-20 flex justify-between items-center">
        {onBack && (
          <button
            onClick={() => { playSound('click'); onBack(); }}
            className="flex items-center gap-2 bg-[#1C5274] border-2 border-white text-white px-3 py-1.5 text-[10px] rounded hover:bg-slate-800 active:scale-95 shadow-pixel font-pixel font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER
          </button>
        )}
        <h2 className="text-base md:text-xl text-yellow-400 font-black tracking-wider uppercase font-pixel drop-shadow-[0_2px_0_#000] mx-auto">
          REGISTRO DE VISITANTE
        </h2>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => <div key={i} className="w-3.5 h-3.5 bg-red-600 animate-pulse border border-white shadow-pixel" />)}
        </div>
      </div>

      {/* CUERPO SCROLLEABLE CON CAMPOS Y OPCIONES ACTUALIZADAS */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 transition-all ${
          activeField ? 'pb-[50vh]' : 'pb-12'
        }`}
      >
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {fields.map(f => {
            const isActive = activeField === f.label;
            const val = formData[f.label] || '';

            return (
              <div key={f.id || f.label} ref={el => fieldRefs.current[f.label] = el} className="flex flex-col space-y-2">
                {f.type !== 'legal' && (
                  <label className={`text-xs md:text-sm font-extrabold uppercase font-mono tracking-wider transition-colors ${
                    isActive ? 'text-yellow-400 drop-shadow-[0_1px_0_#000]' : 'text-white'
                  }`}>
                    {f.label} {f.required && "*"}
                  </label>
                )}

                {f.type === 'text' || f.type === 'email' || f.type === 'number' ? (
                  <div
                    onClick={() => handleFocus(f.label, f.type)}
                    className={`p-4 font-mono text-base md:text-lg border-4 min-h-[60px] flex items-center justify-between cursor-pointer transition-all shadow-pixel ${
                      isActive
                        ? 'bg-black text-white border-yellow-400 ring-4 ring-yellow-400/40 font-bold shadow-pixel-gold'
                        : 'bg-[#0B2233] text-white border-[#2A7BA0] hover:border-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1 overflow-hidden w-full">
                      <span className={isActive ? 'text-yellow-300 font-extrabold text-base md:text-xl truncate drop-shadow-[0_1px_0_#000]' : 'text-white font-bold text-base md:text-lg truncate'}>
                        {val || <span className="text-slate-400 font-normal text-xs md:text-sm italic">Toca para escribir...</span>}
                      </span>
                      {isActive && <span className="animate-pulse text-yellow-400 font-black text-2xl ml-1">_</span>}
                    </div>
                    <Keyboard className={`w-6 h-6 flex-shrink-0 ml-2 ${isActive ? 'text-yellow-400 animate-bounce' : 'text-slate-400'}`} />
                  </div>
                ) : f.type === 'select' ? (
                  <div className="grid grid-cols-1 gap-2">
                    {(f.options || '').split(',').map(o => o.trim()).filter(Boolean).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, [f.label]: opt });
                          setActiveField(null);
                          playSound('jump');
                        }}
                        className={`p-3.5 text-left border-4 text-xs md:text-sm font-mono font-bold transition-all flex items-center justify-between shadow-pixel ${
                          val === opt
                            ? 'bg-yellow-400 text-black border-white shadow-pixel-gold scale-[1.01]'
                            : 'bg-[#0B2233] text-white border-[#2A7BA0] hover:border-white'
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {val === opt && <Check className="w-5 h-5 text-black font-black" />}
                      </button>
                    ))}
                  </div>
                ) : f.type === 'legal' ? (
                  /* AVISO DE PRIVACIDAD EN MÁXIMO CONTRASTE */
                  <div className="bg-black/90 border-4 border-yellow-400 p-4 rounded-sm space-y-3 shadow-pixel-lg">
                    <div className="flex items-center gap-2 text-yellow-400 font-black text-xs md:text-sm border-b border-slate-700 pb-2">
                      <ShieldCheck className="w-5 h-5 text-yellow-400" />
                      <span>[ AVISO LEGAL Y PRIVACIDAD ]</span>
                    </div>

                    <div className="h-24 overflow-y-auto text-xs leading-relaxed text-white font-mono bg-slate-900 p-3 border border-slate-700 custom-scrollbar">
                      <p className="text-yellow-400 font-bold mb-1">TRATAMIENTO DE DATOS PERSONALES:</p>
                      NOVUS INTERNATIONAL INC. utilizará sus datos para fines comerciales, nutrición animal y salud avícola.
                      Al marcar la casilla, acepta nuestra política de tratamiento de datos personales (Habeas Data).
                    </div>

                    <label
                      onClick={() => {
                        playSound('jump');
                        setFormData({ ...formData, [f.label]: !formData[f.label] });
                        setActiveField(null);
                      }}
                      className="flex items-center gap-3 cursor-pointer group select-none pt-1"
                    >
                      <div
                        className={`w-9 h-9 border-4 flex items-center justify-center text-lg font-black transition-all ${
                          val
                            ? 'bg-green-600 border-white text-white scale-105'
                            : 'bg-slate-900 border-slate-500 text-transparent hover:border-white'
                        }`}
                      >
                        {val && "✓"}
                      </div>
                      <span className="text-xs font-mono font-bold text-white group-hover:text-yellow-300">
                        ACEPTO EL TRATAMIENTO DE DATOS.
                      </span>
                    </label>
                  </div>
                ) : null}
              </div>
            );
          })}

          {/* BOTÓN DE ACCIÓN */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full p-5 border-b-8 font-pixel text-base md:text-lg uppercase tracking-wider shadow-2xl transition-all ${
              canSubmit
                ? 'bg-yellow-400 hover:bg-yellow-300 border-yellow-700 text-black font-black cursor-pointer active:border-b-0 active:translate-y-2 animate-pulse'
                : 'bg-slate-800 border-slate-950 text-slate-400 font-bold opacity-50 cursor-not-allowed'
            }`}
          >
            {canSubmit ? "¡INICIAR JUEGO!" : "RELLENA EL FORM"}
          </button>
        </form>
      </div>

      {/* TECLADO VIRTUAL RETRO */}
      {activeField && (
        <div className="bg-slate-950 border-t-4 border-yellow-400 animate-slide-up z-50">
          <VirtualKeyboard
            onKeyPress={handleKeyPress}
            activeInputLabel={activeField}
            currentValue={formData[activeField] || ''}
          />
        </div>
      )}
    </div>
  );
}

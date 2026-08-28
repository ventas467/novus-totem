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
        if (fieldRefs.current[label]) {
          fieldRefs.current[label].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
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

  // Separar campos de texto (Columna Izquierda) y campos de selección / legal (Columna Derecha)
  const textFields = fields.filter(f => f.type === 'text' || f.type === 'email' || f.type === 'number');
  const selectField = fields.find(f => f.type === 'select');
  const legalField = fields.find(f => f.type === 'legal');

  return (
    <div className="flex flex-col h-full w-full bg-[#0F3249] text-white font-pixel select-none overflow-hidden scanlines">
      {/* HEADER PANORÁMICO HORIZONTAL CON MÁXIMO CONTRASTE */}
      <div className="px-6 py-4 border-b-4 border-yellow-400 bg-black shadow-2xl z-30 flex justify-between items-center flex-shrink-0">
        {onBack && (
          <button
            onClick={() => { playSound('click'); onBack(); }}
            className="flex items-center gap-2 bg-[#1C5274] border-2 border-white text-white px-4 py-2 text-xs rounded hover:bg-slate-800 active:scale-95 shadow-pixel font-pixel font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER
          </button>
        )}
        <h2 className="text-lg md:text-2xl text-yellow-400 font-black tracking-widest uppercase font-pixel drop-shadow-[0_2px_0_#000] mx-auto">
          REGISTRO DE VISITANTE
        </h2>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 bg-red-600 animate-pulse border border-white shadow-pixel" />)}
        </div>
      </div>

      {/* CONTENEDOR PANORÁMICO 2 COLUMNAS EN ALTO CONTRASTE AAA */}
      <div
        ref={scrollRef}
        style={{
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain'
        }}
        className="flex-1 overflow-y-auto px-4 py-4 md:px-10 md:py-6 custom-scrollbar relative z-10"
      >
        <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
            <div className="space-y-4 bg-black/90 p-5 md:p-6 border-4 border-yellow-400 rounded-sm shadow-pixel-lg">
              <div className="text-yellow-400 font-black text-sm md:text-base border-b-2 border-yellow-400/60 pb-2 uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_1px_0_#000]">
                <span>📝 DATOS PERSONALES</span>
              </div>

              {textFields.map(f => {
                const isActive = activeField === f.label;
                const val = formData[f.label] || '';

                return (
                  <div key={f.id || f.label} ref={el => fieldRefs.current[f.label] = el} className="flex flex-col space-y-2">
                    <label className={`text-xs md:text-sm font-extrabold uppercase font-mono tracking-wider transition-colors ${
                      isActive ? 'text-yellow-300 drop-shadow-[0_1px_0_#000]' : 'text-yellow-400'
                    }`}>
                      {f.label} {f.required && "*"}
                    </label>

                    <div
                      onClick={() => handleFocus(f.label, f.type)}
                      className={`p-4 font-mono text-sm md:text-base border-4 min-h-[56px] flex items-center justify-between cursor-pointer transition-all shadow-pixel ${
                        isActive
                          ? 'bg-black text-yellow-300 border-yellow-400 ring-4 ring-yellow-400/50 font-black shadow-pixel-gold'
                          : 'bg-[#061522] text-white border-[#2A7BA0] hover:border-yellow-400'
                      }`}
                    >
                      <div className="flex items-center space-x-1 overflow-hidden w-full">
                        <span className={isActive ? 'text-yellow-300 font-black text-base md:text-lg truncate drop-shadow-[0_1px_0_#000]' : 'text-white font-bold text-sm md:text-base truncate'}>
                          {val || <span className="text-slate-300 font-bold text-xs italic">Toca para escribir...</span>}
                        </span>
                        {isActive && <span className="animate-pulse text-yellow-400 font-black text-xl ml-1">_</span>}
                      </div>
                      <Keyboard className={`w-6 h-6 flex-shrink-0 ml-2 ${isActive ? 'text-yellow-400 animate-bounce' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COLUMNA DERECHA: INTERÉS PRINCIPAL, PRIVACIDAD Y BOTÓN DE INICIO */}
            <div className="space-y-4">
              {/* SECCIÓN INTERÉS PRINCIPAL */}
              {selectField && (
                <div className="bg-black/90 p-5 md:p-6 border-4 border-yellow-400 rounded-sm shadow-pixel-lg space-y-3">
                  <label className="text-xs md:text-sm font-black uppercase font-mono tracking-wider text-yellow-400 block border-b-2 border-yellow-400/60 pb-2 drop-shadow-[0_1px_0_#000]">
                    🎯 {selectField.label} *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectField.options || '').split(',').map(o => o.trim()).filter(Boolean).map(opt => {
                      const val = formData[selectField.label] || '';
                      const isSelected = val === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, [selectField.label]: opt });
                            setActiveField(null);
                            playSound('jump');
                          }}
                          className={`p-3.5 text-left border-4 text-xs font-mono font-black transition-all flex items-center justify-between shadow-pixel ${
                            isSelected
                              ? 'bg-yellow-400 text-black border-white shadow-pixel-gold scale-[1.02]'
                              : 'bg-[#061522] text-white border-[#2A7BA0] hover:border-yellow-400'
                          }`}
                        >
                          <span className="leading-snug">{opt}</span>
                          {isSelected && <Check className="w-5 h-5 text-black font-black flex-shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AVISO DE PRIVACIDAD HABEAS DATA EN MÁXIMA LEGIBILIDAD */}
              {legalField && (
                <div className="bg-black border-4 border-yellow-400 p-5 rounded-sm space-y-3 shadow-pixel-lg">
                  <div className="flex items-center gap-2 text-yellow-400 font-black text-xs md:text-sm border-b border-slate-700 pb-2 drop-shadow-[0_1px_0_#000]">
                    <ShieldCheck className="w-6 h-6 text-yellow-400" />
                    <span>[ AVISO LEGAL Y PRIVACIDAD ]</span>
                  </div>

                  <div
                    style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
                    className="h-24 overflow-y-auto text-xs leading-relaxed text-slate-100 font-mono bg-slate-950 p-3 border-2 border-slate-700 custom-scrollbar"
                  >
                    <p className="text-yellow-400 font-black mb-1">TRATAMIENTO DE DATOS PERSONALES:</p>
                    NOVUS INTERNATIONAL INC. utilizará sus datos para fines comerciales, nutrición animal y salud avícola.
                    Al marcar la casilla, acepta nuestra política de tratamiento de datos personales (Habeas Data).
                  </div>

                  <label
                    onClick={() => {
                      playSound('jump');
                      setFormData({ ...formData, [legalField.label]: !formData[legalField.label] });
                      setActiveField(null);
                    }}
                    className="flex items-center gap-3 cursor-pointer group select-none pt-1"
                  >
                    <div
                      className={`w-9 h-9 border-4 flex items-center justify-center text-xl font-black transition-all ${
                        formData[legalField.label]
                          ? 'bg-green-600 border-white text-white scale-105 shadow-pixel-gold'
                          : 'bg-slate-900 border-slate-400 text-transparent hover:border-yellow-400'
                      }`}
                    >
                      {formData[legalField.label] && "✓"}
                    </div>
                    <span className="text-xs font-mono font-bold text-white group-hover:text-yellow-300">
                      ACEPTO EL TRATAMIENTO DE DATOS.
                    </span>
                  </label>
                </div>
              )}

              {/* BOTÓN PRINCIPAL DE ACCIÓN */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full p-4 md:p-5 border-4 font-pixel text-sm md:text-lg uppercase tracking-wider shadow-2xl transition-all ${
                  canSubmit
                    ? 'bg-yellow-400 hover:bg-yellow-300 border-white text-black font-black cursor-pointer active:scale-95 shadow-pixel-gold animate-pulse'
                    : 'bg-slate-900 border-[#2A7BA0] text-yellow-300/80 font-black opacity-80 cursor-not-allowed shadow-pixel'
                }`}
              >
                {canSubmit ? "¡INICIAR JUEGO!" : "RELLENA EL FORM"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* TECLADO VIRTUAL RETRO HORIZONTAL CON ALTO CONTRASTE */}
      {activeField && (
        <div className="bg-slate-950 border-t-4 border-yellow-400 animate-slide-up z-50 flex-shrink-0 max-h-[45vh] overflow-y-auto shadow-pixel-lg">
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

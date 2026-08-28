import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/db';
import PixelChicken from './PixelChicken';
import { playSound } from '../utils/audio';
import { Check, X, Award, Sparkles } from 'lucide-react';

export default function Game({ onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [chickenState, setChickenState] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Estados de la pista de obstáculos 8-Bits
  const [trackPosition, setTrackPosition] = useState(0); // 0 (Inicio), 1 (Valla), 2 (Pajar), 3 (Meta)
  const [jumpArc, setJumpArc] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const qList = await db.questions.toArray();
      if (qList && qList.length > 0) {
        setQuestions(qList);
      }
    } catch (err) {
      console.error("Error cargando preguntas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = idx === currentQ.correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setChickenState('celebrate');
      setJumpArc(true);
      setFeedbackMessage({ type: 'success', text: '¡RESPUESTA CORRECTA! +100 PTS ✨' });
      playSound('jump');
      
      // Avanzar al pollo en la pista de obstáculos
      setTrackPosition(prev => Math.min(3, prev + 1));
      setTimeout(() => setJumpArc(false), 800);
    } else {
      setChickenState('hurt');
      setFeedbackMessage({ type: 'error', text: '¡RESPUESTA INCORRECTA! 💥' });
      playSound('error');
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setChickenState('idle');
        setFeedbackMessage(null);
      } else {
        onFinish(isCorrect ? score + 1 : score, questions.length);
      }
    }, 2200);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0F3249] text-white font-pixel">
        <div className="animate-spin text-4xl mb-4">🎮</div>
        <p className="text-sm animate-pulse">CARGANDO PREGUNTAS...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0F3249] text-white font-pixel p-6 text-center">
        <p className="text-base text-yellow-400 mb-4">NO HAY PREGUNTAS DISPONIBLES</p>
        <button onClick={() => window.location.reload()} className="pixel-button bg-yellow-400 text-black px-6 py-3 font-black">
          REINTENTAR
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  // Cálculo de posición horizontal del pollo en la pista de obstáculos
  const chickenLeftPositions = ['12%', '38%', '65%', '88%'];

  return (
    <div className="flex flex-col h-full bg-[#0F3249] text-white font-pixel select-none overflow-hidden scanlines hardware-accel">
      {/* HEADER DE ESTADO Y PUNTAJE */}
      <div className="p-4 bg-black/80 border-b-4 border-yellow-400 shadow-xl flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <span className="text-yellow-400 text-xs md:text-sm font-black tracking-wider">
            PREGUNTA {currentIndex + 1}/{questions.length}
          </span>
          <span className="bg-novus px-2.5 py-1 text-[10px] text-white border border-novus-light rounded shadow-pixel">
            {currentQ.category || "AVÍCOLA"}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-yellow-400 text-black px-3 py-1 text-xs md:text-sm font-black border-2 border-white shadow-pixel">
            <Award className="w-4 h-4 text-black" />
            <span>{score * 100} PTS</span>
          </div>
        </div>
      </div>

      {/* BARRA DE PROGRESO DEL DESAFÍO */}
      <div className="w-full bg-slate-900 h-3 border-b-2 border-slate-700">
        <div
          className="bg-yellow-400 h-full transition-all duration-300 shadow-pixel-gold"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* PISTA DE OBSTÁCULOS 8-BITS CON ACELERACIÓN GPU */}
      <div className="relative w-full h-32 md:h-40 bg-gradient-to-b from-sky-700 via-sky-800 to-emerald-800 border-b-4 border-emerald-950 overflow-hidden hardware-accel">
        {/* Sol Retro y Nubes */}
        <div className="absolute top-2 right-6 w-10 h-10 bg-yellow-300 rounded-full border-2 border-orange-500 shadow-pixel opacity-90" />
        
        {/* Suelo de Granja 8-Bit */}
        <div className="absolute bottom-0 w-full h-6 bg-amber-900 border-t-4 border-emerald-600 flex justify-between items-center px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-emerald-500/50" />
          ))}
        </div>

        {/* OBSTÁCULOS DE LA PISTA */}
        {/* Obstáculo 1: Valla de Granja */}
        <div className="absolute bottom-6 left-[38%] flex flex-col items-center">
          <div className="text-xl">🧱</div>
          <span className="text-[8px] bg-black/70 text-yellow-300 px-1 border border-yellow-400">VALLA</span>
        </div>

        {/* Obstáculo 2: Pajar Gigante */}
        <div className="absolute bottom-6 left-[65%] flex flex-col items-center">
          <div className="text-2xl">🌽</div>
          <span className="text-[8px] bg-black/70 text-yellow-300 px-1 border border-yellow-400">PAJAR</span>
        </div>

        {/* Meta Novus */}
        <div className="absolute bottom-6 left-[88%] flex flex-col items-center">
          <div className="text-3xl animate-bounce">🏁🏆</div>
          <span className="text-[8px] bg-yellow-400 text-black font-black px-1 border border-black">META NOVUS</span>
        </div>

        {/* POLLO CON SALTO PARABÓLICO EN ACELERACIÓN GPU */}
        <div
          className="absolute bottom-6 transition-all duration-500 ease-out hardware-accel"
          style={{
            left: chickenLeftPositions[trackPosition],
            transform: jumpArc ? 'translate3d(0, -60px, 0)' : 'translate3d(0, 0, 0)'
          }}
        >
          <PixelChicken state={chickenState} size="small" />
          {jumpArc && (
            <div className="absolute -top-6 left-0 text-xs font-black text-yellow-300 animate-pulse">
              ✨ ¡SALTO!
            </div>
          )}
        </div>
      </div>

      {/* ÁREA PRINCIPAL: PREGUNTA Y OPCIONES */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col justify-center max-w-3xl mx-auto w-full space-y-5">
        {/* TARJETA DE PREGUNTA EN ALTO CONTRASTE */}
        <div className="bg-black/90 p-5 md:p-6 border-4 border-yellow-400 shadow-pixel-lg rounded-sm text-center relative z-10">
          <h3 className="text-xs md:text-base leading-relaxed text-white font-mono font-extrabold tracking-wide drop-shadow-[0_1px_0_#000]">
            {currentQ.text}
          </h3>
        </div>

        {/* MENSAJE DE RETROALIMENTACIÓN */}
        {feedbackMessage && (
          <div className={`p-3 text-center text-xs md:text-sm font-black border-4 shadow-pixel animate-slide-up ${
            feedbackMessage.type === 'success' ? 'bg-green-600 border-white text-white' : 'bg-red-600 border-white text-white'
          }`}>
            {feedbackMessage.text}
          </div>
        )}

        {/* GRILLA DE OPCIONES DE RESPUESTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = "bg-[#0B2233] text-white border-[#2A7BA0] hover:border-white";

            if (isAnswered) {
              if (idx === currentQ.correct) {
                btnStyle = "bg-green-600 text-white border-white scale-[1.02] shadow-pixel-gold";
              } else if (selectedOption === idx) {
                btnStyle = "bg-red-600 text-white border-white opacity-90";
              } else {
                btnStyle = "bg-slate-900 text-slate-500 border-slate-700 opacity-40";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 text-left border-4 font-mono text-xs md:text-sm font-bold transition-all flex items-center justify-between shadow-pixel active:scale-95 ${btnStyle}`}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-black/60 border-2 border-white text-yellow-400 font-pixel text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>

                {isAnswered && idx === currentQ.correct && (
                  <Check className="w-6 h-6 text-white font-black ml-2 flex-shrink-0" />
                )}
                {isAnswered && selectedOption === idx && idx !== currentQ.correct && (
                  <X className="w-6 h-6 text-white font-black ml-2 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

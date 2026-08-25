import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/db';
import { playSound } from '../utils/audio';
import PixelChicken from './PixelChicken';
import { CheckCircle2, XCircle, Award } from 'lucide-react';

export default function Game({ onEnd, currentLead }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chickenState, setChickenState] = useState('idle'); // idle, jumping, celebrate, sad
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar preguntas de IndexedDB y seleccionar 3 al azar
    const loadQuestions = async () => {
      try {
        const allQuestions = await db.questions.toArray();
        if (allQuestions && allQuestions.length > 0) {
          // Mezclar y tomar 3
          const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 3);
          setQuestions(shuffled);
        } else {
          // Si no hay en DB, fallback básico
          setQuestions([
            { text: "¿Qué solución NOVUS optimiza la absorción mineral?", options: ["MINTREX®", "Agua", "Maíz", "Sal"], correct: 0 },
            { text: "¿En qué área se enfoca Novus?", options: ["Muebles", "Salud Avícola", "Autos", "Textil"], correct: 1 },
            { text: "¿Beneficio de las enzimas en la dieta?", options: ["Color", "Digestibilidad", "Peso", "Olor"], correct: 1 }
          ]);
        }
      } catch (err) {
        console.error("Error cargando preguntas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedOption(optionIndex);

    const currentQuestion = questions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setChickenState('jumping');
      playSound('jump');
      
      setTimeout(() => {
        setChickenState('celebrate');
        playSound('correct');
      }, 400);
    } else {
      setChickenState('sad');
      playSound('error');
    }

    // Transición a la siguiente pregunta o fin tras 1.2 segundos
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setChickenState('idle');
      } else {
        const finalScore = score + (isCorrect ? 1 : 0);
        onEnd(finalScore, questions.length);
      }
    }, 1300);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-novus-dark text-white font-pixel">
        <div className="animate-spin text-4xl mb-4">🐔</div>
        <p className="text-sm animate-pulse">CARGANDO PREGUNTAS NOVUS...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col justify-between h-full w-full p-4 md:p-8 bg-gradient-to-b from-novus-dark via-novus to-novus-dark scanlines overflow-hidden"
    >
      {/* Header Info Bar */}
      <div className="w-full flex items-center justify-between bg-black/60 p-3 border-2 border-novus-light text-xs z-10">
        <div className="flex items-center gap-2 text-novus-gold">
          <Award className="w-4 h-4" />
          <span>JUGADOR: {currentLead?.name || 'VISITANTE'}</span>
        </div>
        <div className="text-white font-mono bg-novus-light px-3 py-1 border border-white">
          PREGUNTA {currentIndex + 1} DE {questions.length}
        </div>
        <div className="text-green-400 font-bold">
          PUNTAJE: {score}
        </div>
      </div>

      {/* Escenario Retro 8-Bits con el Pollo y Obstáculo */}
      <div className="relative w-full h-44 md:h-56 my-2 border-4 border-white bg-gradient-to-b from-sky-600 via-sky-700 to-novus-light overflow-hidden shadow-pixel z-10 flex flex-col justify-between">
        {/* Sol 8-bits */}
        <div className="absolute top-3 right-8 w-8 h-8 bg-yellow-300 border-2 border-black shadow-pixel animate-pulse" />

        {/* Nubes Retro */}
        <motion.div
          animate={{ x: [-100, 400] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
          className="absolute top-4 text-white/40 text-2xl select-none"
        >
          ☁️
        </motion.div>

        {/* Pollo & Granja */}
        <div className="relative w-full h-full flex items-end justify-between px-12 pb-2">
          {/* Pollo Jugador */}
          <div className="relative z-20">
            <PixelChicken state={chickenState} size="normal" />
          </div>

          {/* Obstáculo Valla / Pajar 8-bits */}
          <motion.div
            animate={isAnswered && selectedOption === currentQ.correct ? { x: [-10, 300], opacity: [1, 0] } : {}}
            transition={{ duration: 0.8 }}
            className="text-4xl z-10 mb-2"
          >
            🌽
          </motion.div>
        </div>

        {/* Suelo de Pasto Pixel Verde */}
        <div className="w-full h-4 bg-green-600 border-t-2 border-green-800 flex">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-1/40 h-full border-r border-green-700 bg-green-500" />
          ))}
        </div>
      </div>

      {/* Tarjeta de Pregunta & Opciones */}
      <div className="w-full bg-novus border-4 border-white p-4 md:p-6 shadow-pixel-lg z-10 space-y-4">
        {/* Texto de la Pregunta */}
        <div className="bg-black/50 p-4 border-2 border-novus-gold text-white text-xs md:text-sm leading-relaxed text-center font-pixel min-h-[60px] flex items-center justify-center">
          {currentQ?.text}
        </div>

        {/* Grid de Opciones (Táctiles Grandes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQ?.options.map((opt, i) => {
            let buttonStyle = 'bg-novus-dark text-white border-novus-light hover:border-white';
            let icon = null;

            if (isAnswered) {
              if (i === currentQ.correct) {
                buttonStyle = 'bg-green-600 text-white border-white font-bold scale-[1.02] shadow-pixel-gold';
                icon = <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />;
              } else if (i === selectedOption) {
                buttonStyle = 'bg-red-600 text-white border-white animate-shake';
                icon = <XCircle className="w-5 h-5 text-white" />;
              } else {
                buttonStyle = 'bg-slate-800/60 text-slate-400 border-slate-700 opacity-50';
              }
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleAnswerSelect(i)}
                className={`p-4 text-left border-4 text-xs md:text-sm transition-all flex items-center justify-between pixel-button active:scale-95 ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="bg-black/60 px-2 py-1 border border-white/40 text-novus-gold font-mono">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer indicador */}
      <div className="text-[10px] text-center text-slate-400 z-10 font-mono">
        RESPONDE CORRECTAMENTE PARA QUE EL POLLO SALTE EL OBSTÁCULO
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/db';
import { playSound } from '../utils/audio';
import PixelChicken from './PixelChicken';
import { CheckCircle2, XCircle, Award, Trophy, Flag, Sparkles } from 'lucide-react';

export default function Game({ onEnd, currentLead }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chickenState, setChickenState] = useState('idle'); // idle, jumping, celebrate, sad
  const [chickenPosition, setChickenPosition] = useState(10); // % de progreso en pista (10%, 40%, 70%, 90%)
  const [jumpArc, setJumpArc] = useState(0); // Y offset para la animación de salto
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [clearedObstacles, setClearedObstacles] = useState([false, false, false]);
  const [failedObstacles, setFailedObstacles] = useState([false, false, false]);
  const [loading, setLoading] = useState(true);

  // Definición de los 3 obstáculos del recorrido de la granja NOVUS
  const OBSTACLES = [
    { id: 0, label: 'VALLA DE GRANJA', icon: '🧱', pos: 30 },
    { id: 1, label: 'PAJAR GIGANTE', icon: '🌽', pos: 60 },
    { id: 2, label: 'META FINAL NOVUS', icon: '🏁', pos: 88 }
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const allQuestions = await db.questions.toArray();
      if (allQuestions && allQuestions.length > 0) {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 3);
        setQuestions(shuffled);
      } else {
        setQuestions([
          { text: "¿Qué solución NOVUS optimiza la absorción mineral?", options: ["MINTREX®", "Agua", "Maíz", "Sal"], correct: 0 },
          { text: "¿En qué se enfoca NOVUS para maximizar producción?", options: ["Muebles", "Salud Intestinal y Nutrición", "Autos", "Textil"], correct: 1 },
          { text: "¿Beneficio clave de las enzimas digestivas en aves?", options: ["Color", "Digestibilidad de nutrientes", "Peso del saco", "Aroma"], correct: 1 }
        ]);
      }
    } catch (err) {
      console.error("Error cargando preguntas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedOption(optionIndex);

    const currentQuestion = questions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correct;
    const stageIdx = currentIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setChickenState('jumping');
      playSound('jump');

      // Animación de salto parabólico sobre el obstáculo actual
      setJumpArc(-80); // Eleva al pollo en el aire
      
      setTimeout(() => {
        // Avanza la posición horizontal en la pista sobrepasando el obstáculo
        const nextPos = OBSTACLES[stageIdx].pos + 5;
        setChickenPosition(nextPos);
        setJumpArc(0);
        setChickenState('celebrate');
        playSound('correct');
        setClearedObstacles(prev => {
          const updated = [...prev];
          updated[stageIdx] = true;
          return updated;
        });
      }, 500);

    } else {
      setChickenState('sad');
      playSound('error');
      setFailedObstacles(prev => {
        const updated = [...prev];
        updated[stageIdx] = true;
        return updated;
      });
    }

    // Transición al siguiente reto o pantalla final
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
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0F3249] text-white font-pixel">
        <div className="animate-spin text-4xl mb-4">🐔</div>
        <p className="text-sm animate-pulse">PREPARANDO PISTA DE OBSTÁCULOS...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col justify-between h-full w-full p-4 md:p-6 bg-gradient-to-b from-[#0F3249] via-[#1C5274] to-[#0F3249] scanlines overflow-hidden select-none"
    >
      {/* Header Info Bar */}
      <div className="w-full flex items-center justify-between bg-black/80 p-3 border-2 border-yellow-400 text-xs z-20 font-mono shadow-pixel">
        <div className="flex items-center gap-2 text-yellow-400 font-bold">
          <Award className="w-4 h-4" />
          <span>JUGADOR: {currentLead ? (currentLead['Nombre Completo'] || currentLead.name || 'VISITANTE') : 'VISITANTE'}</span>
        </div>
        <div className="text-white font-pixel bg-[#1C5274] px-3 py-1 border border-white text-[10px] md:text-xs">
          RETO {currentIndex + 1} DE {questions.length}
        </div>
        <div className="text-green-400 font-black font-pixel text-xs">
          OBSTÁCULOS SUPERADOS: {score}/3
        </div>
      </div>

      {/* ESCENARIO RETRO 8-BITS CON PISTA DE ATLETISMO Y OBSTÁCULOS REALES */}
      <div className="relative w-full h-48 md:h-64 my-2 border-4 border-white bg-gradient-to-b from-sky-600 via-sky-800 to-[#1C5274] overflow-hidden shadow-pixel-lg z-10 flex flex-col justify-between rounded-sm">
        
        {/* Sol 8-bits animado */}
        <div className="absolute top-3 right-6 w-10 h-10 bg-yellow-300 border-2 border-black shadow-pixel animate-pulse z-0" />

        {/* Granja NOVUS al fondo */}
        <div className="absolute bottom-10 right-16 text-4xl opacity-30 select-none pointer-events-none">
          🏡
        </div>

        {/* Nubes Retro */}
        <motion.div
          animate={{ x: [-100, 600] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="absolute top-4 text-white/40 text-2xl select-none"
        >
          ☁️ &nbsp;&nbsp;&nbsp; ☁️
        </motion.div>

        {/* PISTA DE CARRERAS DE LA GRANJA CON 3 OBSTÁCULOS */}
        <div className="relative w-full h-full flex items-end px-4 pb-4">
          
          {/* LÍNEA DE META FINAL CON TROFEO */}
          <div className="absolute right-4 bottom-6 flex flex-col items-center z-10">
            <Trophy className="w-8 h-8 text-yellow-300 animate-bounce drop-shadow-[0_2px_0_#000]" />
            <div className="text-[8px] bg-yellow-400 text-black px-1 font-pixel font-bold">META</div>
          </div>

          {/* RENDERING DE LOS 3 OBSTÁCULOS EN LA PISTA */}
          {OBSTACLES.map((obs, idx) => {
            const isCleared = clearedObstacles[idx];
            const isFailed = failedObstacles[idx];
            const isCurrentTarget = currentIndex === idx;

            return (
              <div
                key={obs.id}
                style={{ left: `${obs.pos}%` }}
                className="absolute bottom-6 flex flex-col items-center z-10 transform -translate-x-1/2"
              >
                {/* Indicador de estado sobre el obstáculo */}
                {isCleared && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs bg-green-500 text-white font-pixel px-1.5 py-0.5 rounded shadow-pixel mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-300" /> PASADO!
                  </motion.div>
                )}
                {isFailed && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs bg-red-600 text-white font-pixel px-1.5 py-0.5 rounded shadow-pixel mb-1">
                    💥 TROPIEZO
                  </motion.div>
                )}
                {isCurrentTarget && !isAnswered && (
                  <div className="text-[9px] bg-yellow-400 text-black font-pixel px-1 animate-pulse mb-1">
                    OBJETIVO
                  </div>
                )}

                {/* Gráfica del Obstáculo 8-bits */}
                <div className={`text-3xl md:text-4xl transition-transform ${isCleared ? 'scale-75 opacity-50' : 'scale-100'} ${isCurrentTarget ? 'animate-bounce' : ''}`}>
                  {obs.icon}
                </div>

                <div className="text-[7px] text-slate-200 font-mono bg-black/60 px-1 border border-slate-500 mt-1">
                  {obs.label}
                </div>
              </div>
            );
          })}

          {/* POLLO CORREDOR (POSICIÓN DINÁMICA HASTA LA META) */}
          <motion.div
            animate={{
              left: `${chickenPosition}%`,
              y: jumpArc
            }}
            transition={{
              left: { duration: 0.8, ease: "easeOut" },
              y: { duration: 0.4, ease: "easeInOut" }
            }}
            className="absolute bottom-6 z-30 transform -translate-x-1/2"
          >
            <PixelChicken state={chickenState} size="normal" />
          </motion.div>

        </div>

        {/* PISTA DE PASTO Y MARCADORES RETRO EN EL SUELO */}
        <div className="w-full h-6 bg-green-700 border-t-4 border-black flex items-center relative overflow-hidden">
          <div className="w-full h-1 bg-yellow-400 absolute top-1 border-b border-black" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 h-full border-r-2 border-green-900 bg-green-600" />
          ))}
        </div>
      </div>

      {/* Tarjeta de Pregunta & Opciones Táctiles */}
      <div className="w-full bg-[#1C5274] border-4 border-white p-4 md:p-5 shadow-pixel-lg z-10 space-y-4 rounded-sm">
        {/* Pregunta Actual */}
        <div className="bg-black p-4 border-2 border-yellow-400 text-yellow-300 text-xs md:text-sm leading-relaxed text-center font-pixel min-h-[64px] flex items-center justify-center shadow-pixel font-bold">
          {currentQ?.text}
        </div>

        {/* Opciones de Respuesta Táctiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQ?.options.map((opt, i) => {
            let buttonStyle = 'bg-[#0B2233] text-white border-[#2A7BA0] hover:border-white';
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
                  <span className="bg-black px-2 py-1 border border-white text-yellow-400 font-mono font-black text-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-mono font-bold">{opt}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer indicador */}
      <div className="text-[10px] text-center text-yellow-300 z-10 font-mono uppercase tracking-wider font-bold">
        ¡RESPONDE CORRECTAMENTE PARA QUE EL POLLO SALTE EL OBSTÁCULO Y LLEGUE A LA META NOVUS! 🏆
      </div>
    </motion.div>
  );
}

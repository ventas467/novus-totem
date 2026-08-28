import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, initDB, syncLocalStorageBackup } from './utils/db';
import Welcome from './components/Welcome';
import LeadForm from './components/LeadForm';
import Game from './components/Game';
import EndScreen from './components/EndScreen';
import Admin from './components/Admin';
import SecretAdminModal from './components/SecretAdminModal';

export default function App() {
  // Vistas: 'welcome' | 'form' | 'game' | 'end' | 'admin'
  const [view, setView] = useState('welcome');
  const [currentLeadData, setCurrentLeadData] = useState(null);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    initDB();
  }, []);

  const handleStart = () => {
    setView('form');
  };

  // Guardar datos del Formulario Dinámico inmediatamente
  const handleFormSubmit = async (formData) => {
    setCurrentLeadData(formData);
    
    try {
      // Se guarda como objeto dinámico en la propiedad `data`
      const newId = await db.leads.add({
        data: formData,
        score: 0,
        totalQuestions: 3,
        date: new Date().toISOString()
      });

      setCurrentLeadId(newId);
      await syncLocalStorageBackup();
    } catch (err) {
      console.error("Error guardando lead en IndexedDB:", err);
    }

    setView('game');
  };

  // Actualizar puntaje del juego al finalizar la trivia
  const handleGameEnd = async (finalScore, numQuestions = 3) => {
    setScore(finalScore);
    setTotalQuestions(numQuestions);

    try {
      if (currentLeadId) {
        await db.leads.update(currentLeadId, {
          score: finalScore,
          totalQuestions: numQuestions
        });
      } else if (currentLeadData) {
        await db.leads.add({
          data: currentLeadData,
          score: finalScore,
          totalQuestions: numQuestions,
          date: new Date().toISOString()
        });
      }

      await syncLocalStorageBackup();
    } catch (err) {
      console.error("Error actualizando puntaje en IndexedDB:", err);
    }

    setView('end');
  };

  // Reset para el siguiente jugador
  const handleFullReset = () => {
    setCurrentLeadData(null);
    setCurrentLeadId(null);
    setScore(0);
    setView('welcome');
  };

  const handleOpenAdminPinModal = () => {
    setShowAdminModal(true);
  };

  const handleAdminSuccess = () => {
    setShowAdminModal(false);
    setView('admin');
  };

  // Extraer el nombre del usuario para mensajes de bienvenida/puntaje
  const getPlayerName = () => {
    if (!currentLeadData) return 'Visitante';
    return currentLeadData["Nombre Completo"] || currentLeadData["Nombre"] || Object.values(currentLeadData)[0] || 'Visitante';
  };

  return (
    <div className="h-screen w-screen bg-novus-dark text-white font-pixel overflow-hidden select-none touch-none">
      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <Welcome
            key="welcome"
            onStart={handleStart}
            onOpenAdmin={handleOpenAdminPinModal}
          />
        )}

        {view === 'form' && (
          <LeadForm
            key="form"
            onSubmit={handleFormSubmit}
            onBack={() => setView('welcome')}
          />
        )}

        {view === 'game' && (
          <Game
            key="game"
            currentLead={{ name: getPlayerName() }}
            onEnd={handleGameEnd}
          />
        )}

        {view === 'end' && (
          <EndScreen
            key="end"
            score={score}
            totalQuestions={totalQuestions}
            currentLead={{ name: getPlayerName() }}
            onReset={handleFullReset}
          />
        )}

        {view === 'admin' && (
          <Admin
            key="admin"
            onBack={() => setView('welcome')}
          />
        )}
      </AnimatePresence>

      {/* Modal PIN de Seguridad */}
      {showAdminModal && (
        <SecretAdminModal
          onSuccess={handleAdminSuccess}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}

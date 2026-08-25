import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, initDB } from './utils/db';
import Welcome from './components/Welcome';
import LeadForm from './components/LeadForm';
import Game from './components/Game';
import EndScreen from './components/EndScreen';
import Admin from './components/Admin';
import SecretAdminModal from './components/SecretAdminModal';

export default function App() {
  // Estados de Vista: 'welcome' | 'form' | 'game' | 'end' | 'admin'
  const [view, setView] = useState('welcome');
  const [currentLead, setCurrentLead] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Inicializar base de datos IndexedDB al arrancar
  useEffect(() => {
    initDB();
  }, []);

  // Iniciar Flujo del Jugador (Desde Pantalla de Bienvenida)
  const handleStart = () => {
    setView('form');
  };

  // Guardar datos del Formulario de Captura
  const handleFormSubmit = (leadData) => {
    setCurrentLead(leadData);
    setView('game');
  };

  // Finalizar Juego de Trivia
  const handleGameEnd = async (finalScore, numQuestions = 3) => {
    setScore(finalScore);
    setTotalQuestions(numQuestions);

    // Guardar registro de lead y puntaje en IndexedDB (Dexie)
    try {
      if (currentLead) {
        await db.leads.add({
          name: currentLead.name,
          email: currentLead.email,
          interest: currentLead.interest,
          score: finalScore,
          totalQuestions: numQuestions,
          date: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error guardando lead en IndexedDB:", err);
    }

    setView('end');
  };

  // Reset Completo para el Siguiente Jugador
  const handleFullReset = () => {
    setCurrentLead(null);
    setScore(0);
    setView('welcome');
  };

  // Abrir Modal de PIN Admin
  const handleOpenAdminPinModal = () => {
    setShowAdminModal(true);
  };

  const handleAdminSuccess = () => {
    setShowAdminModal(false);
    setView('admin');
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
            currentLead={currentLead}
            onEnd={handleGameEnd}
          />
        )}

        {view === 'end' && (
          <EndScreen
            key="end"
            score={score}
            totalQuestions={totalQuestions}
            currentLead={currentLead}
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

      {/* Modal de PIN de Seguridad para Administrador */}
      {showAdminModal && (
        <SecretAdminModal
          onSuccess={handleAdminSuccess}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}

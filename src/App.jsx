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
  const [currentLead, setCurrentLead] = useState(null);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Inicializar base de datos IndexedDB y respaldos al arrancar la app
  useEffect(() => {
    initDB();
  }, []);

  // Iniciar Flujo
  const handleStart = () => {
    setView('form');
  };

  // Guardar datos del Formulario INMEDIATAMENTE en IndexedDB y respaldar
  const handleFormSubmit = async (leadData) => {
    setCurrentLead(leadData);
    
    try {
      // Guardar el registro inmediatamente en IndexedDB (aún sin puntaje final)
      const newId = await db.leads.add({
        name: leadData.name,
        email: leadData.email,
        interest: leadData.interest,
        score: 0,
        totalQuestions: 3,
        date: new Date().toISOString()
      });

      setCurrentLeadId(newId);
      await syncLocalStorageBackup();
    } catch (err) {
      console.error("Error guardando registro inicial en IndexedDB:", err);
    }

    setView('game');
  };

  // Actualizar puntaje del juego al finalizar la trivia
  const handleGameEnd = async (finalScore, numQuestions = 3) => {
    setScore(finalScore);
    setTotalQuestions(numQuestions);

    try {
      if (currentLeadId) {
        // Actualizar el registro existente con el puntaje obtenido
        await db.leads.update(currentLeadId, {
          score: finalScore,
          totalQuestions: numQuestions
        });
      } else if (currentLead) {
        // Fallback si no había ID previo
        await db.leads.add({
          name: currentLead.name,
          email: currentLead.email,
          interest: currentLead.interest,
          score: finalScore,
          totalQuestions: numQuestions,
          date: new Date().toISOString()
        });
      }

      // Sincronizar espejo de seguridad en LocalStorage
      await syncLocalStorageBackup();
    } catch (err) {
      console.error("Error actualizando puntaje en IndexedDB:", err);
    }

    setView('end');
  };

  // Reset de interfaz para el Siguiente Jugador (NO borra la base de datos)
  const handleFullReset = () => {
    setCurrentLead(null);
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

      {/* Modal de PIN para Administrador */}
      {showAdminModal && (
        <SecretAdminModal
          onSuccess={handleAdminSuccess}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}

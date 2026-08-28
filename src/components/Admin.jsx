import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, resetQuestionsToDefault, sanitizeDatabaseFormConfigAndLeads, syncLocalStorageBackup } from '../utils/db';
import { exportLeadsToExcel } from '../utils/exporter';
import { playSound } from '../utils/audio';
import AdminFormManager from './AdminFormManager';
import { Download, Trash2, Plus, Edit2, ArrowLeft, RefreshCw, Database, HelpCircle, Users, Save, Sliders, Sparkles } from 'lucide-react';

export default function Admin({ onBack }) {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'questions' | 'formConfig'
  const [leads, setLeads] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Pregunta
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [qText, setQText] = useState('');
  const [qOpt0, setQOpt0] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [qCategory, setQCategory] = useState('Salud Intestinal');
  const [showQModal, setShowQModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Auto sanitización previa para asegurar datos limpios
      await sanitizeDatabaseFormConfigAndLeads();
      const l = await db.leads.toArray();
      const q = await db.questions.toArray();
      const f = await db.formConfig.orderBy('order').toArray();
      setLeads(l.reverse());
      setQuestions(q);
      setFormFields(f);
      await syncLocalStorageBackup();
    } catch (e) {
      console.error("Error al cargar datos de admin:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSanitizeDB = async () => {
    playSound('click');
    if (confirm("¿Desear estandarizar la base de datos y limpiar todos los campos antiguos mezclados?")) {
      setLoading(true);
      await sanitizeDatabaseFormConfigAndLeads();
      await loadData();
      alert("Base de datos sanitizada correctamente. Todos los campos están organizados.");
    }
  };

  const handleExportExcel = () => {
    playSound('click');
    exportLeadsToExcel(leads);
  };

  const handleDownloadJsonBackup = () => {
    playSound('click');
    const backupData = {
      timestamp: new Date().toISOString(),
      leadsCount: leads.length,
      leads: leads,
      questions: questions,
      formConfig: formFields
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NOVUS_Backup_DB_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLeads = async () => {
    if (confirm("⚠️ ¿Deseas borrar TODOS los registros de visitantes (leads) de la base de datos local?\nEsta acción no se puede deshacer.")) {
      playSound('error');
      await db.leads.clear();
      await syncLocalStorageBackup();
      loadData();
    }
  };

  const handleResetQuestions = async () => {
    if (confirm("¿Restablecer las preguntas a la configuración predeterminada de NOVUS?")) {
      playSound('click');
      await resetQuestionsToDefault();
      loadData();
    }
  };

  // --- CRUD PREGUNTAS ---
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim() || !qOpt0.trim() || !qOpt1.trim() || !qOpt2.trim() || !qOpt3.trim()) {
      alert("Por favor completa el texto de la pregunta y sus 4 opciones.");
      return;
    }

    const qData = {
      text: qText.trim(),
      options: [qOpt0.trim(), qOpt1.trim(), qOpt2.trim(), qOpt3.trim()],
      correct: Number(qCorrect),
      category: qCategory
    };

    if (editingQuestion) {
      await db.questions.update(editingQuestion.id, qData);
    } else {
      await db.questions.add(qData);
    }

    playSound('click');
    await syncLocalStorageBackup();
    closeQModal();
    loadData();
  };

  const handleDeleteQuestion = async (id) => {
    if (confirm("¿Eliminar esta pregunta de la trivia?")) {
      playSound('error');
      await db.questions.delete(id);
      await syncLocalStorageBackup();
      loadData();
    }
  };

  const openQModal = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setQText(q.text);
      setQOpt0(q.options[0] || '');
      setQOpt1(q.options[1] || '');
      setQOpt2(q.options[2] || '');
      setQOpt3(q.options[3] || '');
      setQCorrect(q.correct || 0);
      setQCategory(q.category || 'Salud Intestinal');
    } else {
      setEditingQuestion(null);
      setQText('');
      setQOpt0('');
      setQOpt1('');
      setQOpt2('');
      setQOpt3('');
      setQCorrect(0);
      setQCategory('Salud Intestinal');
    }
    setShowQModal(true);
  };

  const closeQModal = () => {
    setShowQModal(false);
    setEditingQuestion(null);
  };

  // Lista estricta y limpia de cabeceras activas oficiales
  const OFFICIAL_HEADERS = ["Nombre Completo", "Empresa", "Correo Electrónico", "País", "Interés", "Privacidad"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full bg-slate-900 text-white font-mono p-6 overflow-hidden"
    >
      {/* Admin Header */}
      <div className="flex items-center justify-between pb-4 border-b-4 border-novus-gold mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-novus-gold" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-pixel text-novus-gold uppercase">
              PANEL DE CONTROL • STAND NOVUS
            </h1>
            <p className="text-xs text-slate-400">IndexedDB v5 + Campos de Formulario Estandarizados</p>
          </div>
        </div>
        <button
          onClick={() => { playSound('click'); onBack(); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-3 border-2 border-white shadow-pixel text-xs rounded active:scale-95 font-pixel"
        >
          <ArrowLeft className="w-4 h-4" /> SALIR AL JUEGO
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => { setActiveTab('leads'); playSound('click'); loadData(); }}
          className={`flex items-center gap-2 px-5 py-3 border-2 text-xs font-bold transition-all ${
            activeTab === 'leads'
              ? 'bg-novus text-white border-novus-gold shadow-pixel'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
          }`}
        >
          <Users className="w-4 h-4" /> LEADS REGISTRADOS ({leads.length})
        </button>
        <button
          onClick={() => { setActiveTab('questions'); playSound('click'); loadData(); }}
          className={`flex items-center gap-2 px-5 py-3 border-2 text-xs font-bold transition-all ${
            activeTab === 'questions'
              ? 'bg-novus text-white border-novus-gold shadow-pixel'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> PREGUNTAS ({questions.length})
        </button>
        <button
          onClick={() => { setActiveTab('formConfig'); playSound('click'); loadData(); }}
          className={`flex items-center gap-2 px-5 py-3 border-2 text-xs font-bold transition-all ${
            activeTab === 'formConfig'
              ? 'bg-novus text-white border-novus-gold shadow-pixel'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
          }`}
        >
          <Sliders className="w-4 h-4" /> CONFIGURACIÓN FORMULARIO ({formFields.length})
        </button>
      </div>

      {/* TAB 1: LEADS REGISTRADOS CON CAMPOS ESTRICTOS */}
      {activeTab === 'leads' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800 border-2 border-slate-700 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="text-xs text-slate-300">
              Registros estandarizados (6 campos activos oficiales):
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSanitizeDB}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 border-2 border-white shadow-pixel text-xs active:scale-95"
              >
                <Sparkles className="w-4 h-4" /> LIMPIAR CAMPOS DUP.
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 border-2 border-white shadow-pixel text-xs active:scale-95"
              >
                <Download className="w-4 h-4" /> EXPORTAR EXCEL (.XLSX)
              </button>
              <button
                onClick={handleDownloadJsonBackup}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 border-2 border-white shadow-pixel text-xs active:scale-95"
              >
                <Save className="w-4 h-4" /> RESPALDO JSON
              </button>
              <button
                onClick={handleClearLeads}
                className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2 border-2 border-white shadow-pixel text-xs active:scale-95"
              >
                <Trash2 className="w-4 h-4" /> VACIAR BASE DE DATOS
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto border-2 border-slate-900 bg-slate-950">
            <table className="w-full text-xs text-left border-collapse min-w-max">
              <thead className="sticky top-0 bg-novus text-novus-gold font-pixel text-[10px] z-10 shadow-md">
                <tr>
                  <th className="p-3 border border-slate-700 min-w-[70px]">ID</th>
                  <th className="p-3 border border-slate-700 min-w-[170px] whitespace-nowrap">FECHA Y HORA</th>
                  {OFFICIAL_HEADERS.map(h => (
                    <th key={h} className="p-3 border border-slate-700 uppercase min-w-[150px] whitespace-nowrap">{h}</th>
                  ))}
                  <th className="p-3 border border-slate-700 text-center min-w-[100px] whitespace-nowrap">PUNTAJE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={OFFICIAL_HEADERS.length + 3} className="p-8 text-center text-slate-500 font-sans">
                      No hay registros guardados en la base de datos local.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const dataObj = lead.data || {};

                    return (
                      <tr key={lead.id} className="hover:bg-slate-900 transition-colors">
                        <td className="p-3 border border-slate-800 text-slate-400 font-bold">#{lead.id}</td>
                        <td className="p-3 border border-slate-800 text-slate-300 whitespace-nowrap">
                          {lead.date ? new Date(lead.date).toLocaleString('es-ES') : '-'}
                        </td>
                        {OFFICIAL_HEADERS.map(h => {
                          const val = dataObj[h];
                          return (
                            <td key={h} className="p-3 border border-slate-800 text-white whitespace-nowrap">
                              {(val !== undefined && val !== null && String(val).trim() !== '') ? String(val) : '-'}
                            </td>
                          );
                        })}
                        <td className="p-3 border border-slate-800 text-center font-bold text-green-400 whitespace-nowrap">
                          {lead.score !== undefined ? lead.score : 0}/3
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PREGUNTAS TRIVIA */}
      {activeTab === 'questions' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800 border-2 border-slate-700 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="text-xs text-slate-300">
              Preguntas cargadas dinámicamente en la trivia:
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openQModal()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 border-2 border-white shadow-pixel text-xs active:scale-95"
              >
                <Plus className="w-4 h-4" /> AGREGAR PREGUNTA
              </button>
              <button
                onClick={handleResetQuestions}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 border border-slate-500 text-xs active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> RESTAURAR DEFECTO
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="bg-slate-900 p-4 border-2 border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-novus-gold">
                    <span className="bg-novus p-1 text-[10px] text-white"># {idx + 1}</span>
                    <span>{q.text}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 border ${
                          oIdx === q.correct
                            ? 'bg-green-950 border-green-500 text-green-300 font-bold'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correct && '✓'}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 self-end md:self-center">
                  <button onClick={() => openQModal(q)} className="p-2 bg-amber-600 hover:bg-amber-500 text-white text-xs border border-white">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white text-xs border border-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURACIÓN FORMULARIO DINÁMICO */}
      {activeTab === 'formConfig' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <AdminFormManager />
        </div>
      )}

      {/* Modal Pregunta */}
      {showQModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-novus border-4 border-white p-6 w-full max-w-xl shadow-pixel-lg space-y-4 font-mono text-xs">
            <h3 className="text-base font-bold text-novus-gold font-pixel uppercase">
              {editingQuestion ? 'EDITAR PREGUNTA' : 'CREAR NUEVA PREGUNTA TRIVIA'}
            </h3>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-slate-200 mb-1">PREGUNTA (TEXTO):</label>
                <input type="text" value={qText} onChange={(e) => setQText(e.target.value)} className="w-full p-3 bg-slate-900 border-2 border-novus-light text-white text-xs" required />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-200">OPCIONES DE RESPUESTA:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={qOpt0} onChange={(e) => setQOpt0(e.target.value)} placeholder="Opción A" className="p-2 bg-slate-900 border border-slate-700 text-white" required />
                  <input type="text" value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} placeholder="Opción B" className="p-2 bg-slate-900 border border-slate-700 text-white" required />
                  <input type="text" value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} placeholder="Opción C" className="p-2 bg-slate-900 border border-slate-700 text-white" required />
                  <input type="text" value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} placeholder="Opción D" className="p-2 bg-slate-900 border border-slate-700 text-white" required />
                </div>
              </div>
              <div>
                <label className="block text-slate-200 mb-1">ÍNDICE DE RESPUESTA CORRECTA:</label>
                <select value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} className="w-full p-3 bg-slate-900 border-2 border-novus-light text-white text-xs">
                  <option value={0}>Opción A</option>
                  <option value={1}>Opción B</option>
                  <option value={2}>Opción C</option>
                  <option value={3}>Opción D</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-novus-light">
                <button type="button" onClick={closeQModal} className="px-4 py-2 bg-slate-700 text-white font-bold border border-slate-500">CANCELAR</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold border-2 border-white shadow-pixel">GUARDAR PREGUNTA</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

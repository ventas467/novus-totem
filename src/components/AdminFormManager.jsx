import React, { useState, useEffect } from 'react';
import { db, syncLocalStorageBackup, resetFormConfigToDefault } from '../utils/db';
import { playSound } from '../utils/audio';
import { Plus, Trash2, Edit2, Sliders, RefreshCw, Check } from 'lucide-react';

export default function AdminFormManager() {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ label: '', type: 'text', options: '', required: true });
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const data = await db.formConfig.toArray();
      setFields(data);
    } catch (e) {
      console.error("Error cargando campos de formulario:", e);
    }
  };

  const handleAddField = async () => {
    if (!newField.label.trim()) return;

    playSound('click');
    const fieldData = {
      label: newField.label.trim(),
      type: newField.type,
      required: Boolean(newField.required),
      options: newField.type === 'select' ? newField.options.trim() : ''
    };

    if (editingField) {
      await db.formConfig.update(editingField.id, fieldData);
      setEditingField(null);
    } else {
      await db.formConfig.add(fieldData);
    }

    setNewField({ label: '', type: 'text', options: '', required: true });
    await syncLocalStorageBackup();
    fetchFields();
  };

  const handleEditClick = (f) => {
    playSound('click');
    setEditingField(f);
    setNewField({
      label: f.label,
      type: f.type,
      options: f.options || '',
      required: f.required !== false
    });
  };

  const handleDeleteField = async (id) => {
    if (confirm("¿Eliminar este campo del formulario de registro?")) {
      playSound('error');
      await db.formConfig.delete(id);
      await syncLocalStorageBackup();
      fetchFields();
    }
  };

  const handleResetForm = async () => {
    if (confirm("¿Restablecer los campos del formulario a la configuración por defecto de NOVUS?")) {
      playSound('click');
      await resetFormConfigToDefault();
      fetchFields();
    }
  };

  return (
    <div className="p-6 bg-slate-900 border-2 border-novus-light rounded-sm shadow-pixel font-mono text-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-3">
        <div className="flex items-center gap-2 text-novus-gold font-pixel text-sm uppercase">
          <Sliders className="w-5 h-5" /> CONFIGURAR CAMPOS DEL FORMULARIO
        </div>
        <button
          onClick={handleResetForm}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 border border-slate-500 text-xs active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" /> RESTAURAR POR DEFECTO
        </button>
      </div>

      {/* Formulario para agregar / editar campo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-950 p-4 border border-slate-800">
        <div className="md:col-span-2">
          <label className="block text-[10px] text-slate-400 mb-1">ETIQUETA (EJ: PAÍS / TAMAÑO DE GRANJA):</label>
          <input
            type="text"
            placeholder="Etiqueta del campo"
            className="w-full p-2.5 bg-slate-900 border border-novus-light text-white text-xs"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 mb-1">TIPO DE CONTROL:</label>
          <select
            className="w-full p-2.5 bg-slate-900 border border-novus-light text-white text-xs"
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          >
            <option value="text">Texto Corto</option>
            <option value="email">Email</option>
            <option value="number">Número</option>
            <option value="select">Lista Desplegable</option>
          </select>
        </div>

        {newField.type === 'select' ? (
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">OPCIONES (SEPARADAS POR COMAS):</label>
            <input
              type="text"
              placeholder="Opción 1, Opción 2, Opción 3"
              className="w-full p-2.5 bg-slate-900 border border-novus-light text-white text-xs"
              value={newField.options}
              onChange={(e) => setNewField({ ...newField, options: e.target.value })}
            />
          </div>
        ) : (
          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Requerido</span>
            </label>
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={handleAddField}
            className="w-full p-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold border border-white shadow-pixel flex items-center justify-center gap-1 active:scale-95"
          >
            {editingField ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{editingField ? 'GUARDAR' : 'AÑADIR'}</span>
          </button>
        </div>
      </div>

      {/* Lista de Campos Existentes */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {fields.map((f, idx) => (
          <div key={f.id || idx} className="flex justify-between bg-slate-950 p-3.5 border border-slate-800 items-center hover:border-slate-600 transition-colors">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="bg-novus px-2 py-0.5 text-[10px] text-novus-gold">#{idx + 1}</span>
                <span>{f.label}</span>
                {f.required && <span className="text-[10px] text-red-400 font-mono">*</span>}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                TIPO: <span className="text-novus-gold uppercase">{f.type}</span>
                {f.type === 'select' && ` | OPCIONES: ${f.options}`}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEditClick(f)} className="p-2 bg-amber-600 hover:bg-amber-500 text-white text-xs border border-white">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeleteField(f.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white text-xs border border-white">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

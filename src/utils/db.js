import Dexie from 'dexie';

export const db = new Dexie('NovusStandDB');

db.version(5).stores({
  leads: '++id, data, score, totalQuestions, date',
  questions: '++id, text, options, correct, category',
  formConfig: '++id, label, type, required, options, order'
});

export const OFFICIAL_QUESTIONS = [
  {
    text: "¿Cuál es uno de los principales beneficios de la proteasa CIBENZA® DP100 Aditivo Enzimático, en las dietas de aves?",
    options: [
      "Incrementar el consumo de alimento",
      "Sustituir las fuentes de proteína de la dieta",
      "Disminuir inhibidores de tripsina y mejorar la digestibilidad de nutrientes",
      "Aumentar la concentración de minerales en el alimento"
    ],
    correct: 2,
    category: "Factores antinutricionales / Enzimas"
  },
  {
    text: "¿Qué solución de minerales bis-quelados de NOVUS está diseñada para favorecer una utilización eficiente de los minerales?",
    options: [
      "MINTREX® Oligoelementos Bis-Quelados",
      "AVIMATRIX® Aditivo Eubiótico",
      "CIBENZA® DP100 Aditivo Enzimático",
      "NEXT ENHANCE® 150 Solución para Piensos"
    ],
    correct: 0,
    category: "Nutrición Mineral"
  },
  {
    text: "¿Cuál es el principal beneficio de NEXT ENHANCE® 150 Solución para Piensos en la nutrición de aves?",
    options: [
      "Mejorar la pigmentación de la piel y plumas",
      "Apoyar la salud intestinal promoviendo la mejora de la microbiota intestinal",
      "Incrementar el contenido de proteína del alimento",
      "Sustituir los minerales en la dieta"
    ],
    correct: 1,
    category: "Salud Intestinal"
  }
];

export const OFFICIAL_ACTIVE_FORM_CONFIG = [
  { order: 1, label: "Nombre Completo", type: "text", required: true, options: "" },
  { order: 2, label: "Empresa", type: "text", required: true, options: "" },
  { order: 3, label: "Correo Electrónico", type: "email", required: true, options: "" },
  { order: 4, label: "País", type: "text", required: true, options: "" },
  { order: 5, label: "Interés Principal", type: "select", required: true, options: "Nutrición Mineral,Factores antinutricionales / Enzimas,Salud Intestinal,Otra área avícola" },
  { order: 6, label: "Privacidad", type: "legal", required: true, options: "" }
];

export const requestPersistentStorage = async () => {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`IndexedDB almacenamiento persistente garantizado: ${isPersisted}`);
      return isPersisted;
    } catch (e) {
      console.warn("No se pudo solicitar almacenamiento persistente:", e);
    }
  }
  return false;
};

export const syncLocalStorageBackup = async () => {
  try {
    const leads = await db.leads.toArray();
    const questions = await db.questions.toArray();
    const formConfig = await db.formConfig.toArray();
    localStorage.setItem('NOVUS_BACKUP_LEADS', JSON.stringify(leads));
    localStorage.setItem('NOVUS_BACKUP_QUESTIONS', JSON.stringify(questions));
    localStorage.setItem('NOVUS_BACKUP_FORM_CONFIG', JSON.stringify(formConfig));
  } catch (e) {
    console.warn("Error al sincronizar respaldo LocalStorage:", e);
  }
};

/**
 * Función de Limpieza Atómica y Estandarización de Base de Datos.
 * Borra cualquier pregunta previa y establece estrictamente las 3 preguntas oficiales y las 4 áreas de interés.
 */
export const sanitizeDatabaseFormConfigAndLeads = async () => {
  try {
    await db.transaction('rw', db.formConfig, db.questions, db.leads, async () => {
      // 1. Reemplazar preguntas atómicamente por las 3 oficiales
      await db.questions.clear();
      await db.questions.bulkAdd(OFFICIAL_QUESTIONS);

      // 2. Reemplazar configuración de formulario atómicamente por la oficial
      await db.formConfig.clear();
      await db.formConfig.bulkAdd(OFFICIAL_ACTIVE_FORM_CONFIG);

      // 3. Normalizar datos de visitantes guardados
      const allLeads = await db.leads.toArray();
      for (const lead of allLeads) {
        const rawData = lead.data || {};
        const cleanData = {
          'Nombre Completo': rawData['Nombre Completo'] || rawData['Nombre'] || lead.name || '-',
          'Empresa': rawData['Empresa'] || '-',
          'Correo Electrónico': rawData['Correo Electrónico'] || rawData['Email'] || lead.email || '-',
          'País': rawData['País'] || '-',
          'Interés Principal': rawData['Interés Principal'] || rawData['Interés'] || lead.interest || 'Nutrición Mineral',
          'Privacidad': rawData['Privacidad'] !== undefined ? (rawData['Privacidad'] ? 'Aceptado' : 'No Aceptado') : 'Aceptado'
        };

        await db.leads.update(lead.id, {
          data: cleanData
        });
      }
    });

    await syncLocalStorageBackup();
    console.log("Base de datos actualizada con NEXT ENHANCE® 150.");
    return true;
  } catch (err) {
    console.error("Error en la transacción atómica de sanitización:", err);
    return false;
  }
};

export const initDB = async () => {
  try {
    await requestPersistentStorage();
    await sanitizeDatabaseFormConfigAndLeads();
  } catch (err) {
    console.error("Error al inicializar IndexedDB:", err);
  }
};

export const resetQuestionsToDefault = async () => {
  await db.questions.clear();
  await db.questions.bulkAdd(OFFICIAL_QUESTIONS);
  await syncLocalStorageBackup();
};

export const resetFormConfigToDefault = async () => {
  await sanitizeDatabaseFormConfigAndLeads();
};

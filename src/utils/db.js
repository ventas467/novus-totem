import Dexie from 'dexie';

export const db = new Dexie('NovusStandDB');

db.version(1).stores({
  leads: '++id, name, email, interest, score, date, leadId',
  questions: '++id, text, options, correct, category'
});

export const INITIAL_QUESTIONS = [
  {
    text: "¿Qué solución de oligoelementos biquelados NOVUS optimiza la absorción mineral y la calidad del cascarón?",
    options: ["MINTREX®", "Agua destilada", "Maíz molido", "Sal común"],
    correct: 0,
    category: "Calidad de Cascarón"
  },
  {
    text: "¿En qué área clave se enfoca NOVUS para maximizar la producción avícola sostenible?",
    options: ["Diseño de galpones", "Salud Intestinal y Nutrición", "Maquinaria pesada", "Empaques de cartón"],
    correct: 1,
    category: "Salud Intestinal"
  },
  {
    text: "¿Cuál es el principal beneficio de las enzimas digestivas (ej. CIBENZA®) en las dietas de aves?",
    options: ["Dar color a las plumas", "Mejorar la digestibilidad de nutrientes y la conversión alimenticia", "Aumentar el tamaño del saco", "Cambiar el aroma del alimento"],
    correct: 1,
    category: "Nutrición/Enzimas"
  },
  {
    text: "¿Qué impacto tienen los eubióticos NOVUS en la microflora intestinal del pollo de engorde?",
    options: ["Inhiben patógenos y refuerzan la barrera intestinal", "Ningún impacto", "Reducen la ingesta de agua", "Aumentan la humedad de la cama"],
    correct: 0,
    category: "Salud Intestinal"
  },
  {
    text: "¿Por qué MINTREX® ofrece mayor biodisponibilidad que los minerales inorgánicos?",
    options: ["Por su unión covalente a dos moléculas de HMTBa", "Por su color brillante", "Por ser soluble en aceite", "Por su origen sintético simple"],
    correct: 0,
    category: "Nutrición/Enzimas"
  }
];

// Solicitar al navegador que la base de datos sea PERSISTENTE (sin borrado automático por almacenamiento bajo)
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

// Guardar copia de respaldo en LocalStorage para máxima seguridad
export const syncLocalStorageBackup = async () => {
  try {
    const leads = await db.leads.toArray();
    const questions = await db.questions.toArray();
    localStorage.setItem('NOVUS_BACKUP_LEADS', JSON.stringify(leads));
    localStorage.setItem('NOVUS_BACKUP_QUESTIONS', JSON.stringify(questions));
  } catch (e) {
    console.warn("Error al sincronizar respaldo LocalStorage:", e);
  }
};

// Restaurar desde LocalStorage si IndexedDB por alguna razón estuviera vacía
export const restoreFromLocalStorageBackup = async () => {
  try {
    const leadsBackup = localStorage.getItem('NOVUS_BACKUP_LEADS');
    const questionsBackup = localStorage.getItem('NOVUS_BACKUP_QUESTIONS');

    const leadsCount = await db.leads.count();
    if (leadsCount === 0 && leadsBackup) {
      const parsedLeads = JSON.parse(leadsBackup);
      if (Array.isArray(parsedLeads) && parsedLeads.length > 0) {
        await db.leads.bulkAdd(parsedLeads);
        console.log("Leads restaurados exitosamente desde el respaldo LocalStorage.");
      }
    }

    const questionsCount = await db.questions.count();
    if (questionsCount === 0 && questionsBackup) {
      const parsedQuestions = JSON.parse(questionsBackup);
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        await db.questions.bulkAdd(parsedQuestions);
      }
    }
  } catch (e) {
    console.warn("Error al restaurar respaldo:", e);
  }
};

// Inicialización completa de la base de datos
export const initDB = async () => {
  try {
    // 1. Garantizar persistencia en el navegador
    await requestPersistentStorage();

    // 2. Intentar restaurar respaldo secundario si la DB fue reseteada
    await restoreFromLocalStorageBackup();

    // 3. Semilla de preguntas iniciales si está vacía
    const count = await db.questions.count();
    if (count === 0) {
      await db.questions.bulkAdd(INITIAL_QUESTIONS);
      console.log("Preguntas iniciales creadas en IndexedDB.");
    }

    // 4. Actualizar espejo de respaldo
    await syncLocalStorageBackup();
  } catch (err) {
    console.error("Error inicializando IndexedDB:", err);
  }
};

export const resetQuestionsToDefault = async () => {
  await db.questions.clear();
  await db.questions.bulkAdd(INITIAL_QUESTIONS);
  await syncLocalStorageBackup();
};

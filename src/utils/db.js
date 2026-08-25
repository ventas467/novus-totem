import Dexie from 'dexie';

export const db = new Dexie('NovusStandDB');

db.version(1).stores({
  leads: '++id, name, email, interest, score, date',
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

// Semilla de preguntas iniciales si la base de datos está vacía
export const initDB = async () => {
  try {
    const count = await db.questions.count();
    if (count === 0) {
      await db.questions.bulkAdd(INITIAL_QUESTIONS);
      console.log("Base de datos de preguntas Novus inicializada correctamente.");
    }
  } catch (err) {
    console.error("Error al inicializar IndexedDB Dexie:", err);
  }
};

export const resetQuestionsToDefault = async () => {
  await db.questions.clear();
  await db.questions.bulkAdd(INITIAL_QUESTIONS);
};

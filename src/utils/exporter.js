import * as XLSX from 'xlsx';

export const exportLeadsToExcel = (leadsList) => {
  if (!leadsList || leadsList.length === 0) {
    alert("No hay registros de leads para exportar.");
    return false;
  }

  // Mapear los datos para una mejor lectura en la hoja de Excel
  const dataToExport = leadsList.map(lead => {
    const leadDate = lead.date ? new Date(lead.date) : new Date();
    const formattedDate = leadDate.toLocaleDateString('es-ES') + ' ' + leadDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const score = lead.score !== undefined ? lead.score : 0;
    const totalQuestions = lead.totalQuestions || 3;
    const percentage = Math.round((score / totalQuestions) * 100);

    return {
      'ID Registro': lead.id || '-',
      'Fecha y Hora': formattedDate,
      'Nombre Completo': lead.name || 'Sin Nombre',
      'Correo Electrónico': lead.email || 'Sin Email',
      'Interés Principal': lead.interest || 'No especificado',
      'Puntaje Trivia': `${score}/${totalQuestions}`,
      'Porcentaje (%)': `${percentage}%`
    };
  });

  // Crear la hoja de trabajo (Worksheet)
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);

  // Ancho automático de columnas
  const colWidths = [
    { wch: 12 }, // ID
    { wch: 20 }, // Fecha
    { wch: 28 }, // Nombre
    { wch: 32 }, // Email
    { wch: 25 }, // Interés
    { wch: 15 }, // Puntaje
    { wch: 15 }  // Porcentaje
  ];
  worksheet['!cols'] = colWidths;

  // Crear el libro de trabajo (Workbook)
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads NOVUS Stand");

  // Generar nombre de archivo con fecha actual
  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `NOVUS_Leads_Stand_${todayStr}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, filename);
  return true;
};

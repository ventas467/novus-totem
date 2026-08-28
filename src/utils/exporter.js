import * as XLSX from 'xlsx';

export const exportLeadsToExcel = (leadsList) => {
  if (!leadsList || leadsList.length === 0) {
    alert("No hay registros de visitantes para exportar.");
    return false;
  }

  // 1. Recopilar todas las claves dinámicas únicas de todos los leads (legados e IndexedDB v2)
  const dynamicKeysSet = new Set();
  leadsList.forEach(lead => {
    const dataObj = lead.data || {};
    Object.keys(dataObj).forEach(k => dynamicKeysSet.add(k));
    
    // Si es un registro legado de v1
    if (lead.name) dynamicKeysSet.add('Nombre Completo');
    if (lead.email) dynamicKeysSet.add('Correo Electrónico');
    if (lead.interest) dynamicKeysSet.add('Interés Principal');
  });

  const dynamicKeysList = Array.from(dynamicKeysSet);

  // 2. Construir filas estandarizadas con todas las columnas presentes en cada fila
  const dataToExport = leadsList.map(lead => {
    const leadDate = lead.date ? new Date(lead.date) : new Date();
    const formattedDate = leadDate.toLocaleDateString('es-ES') + ' ' + leadDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const score = lead.score !== undefined ? lead.score : 0;
    const totalQuestions = lead.totalQuestions || 3;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Mapear campos dinámicos
    const dataObj = lead.data || {};
    const legacyMap = {
      'Nombre Completo': lead.name,
      'Correo Electrónico': lead.email,
      'Interés Principal': lead.interest
    };

    const row = {
      'ID Registro': lead.id || '-',
      'Fecha y Hora': formattedDate
    };

    // Agregar todas las columnas dinámicas de forma ordenada
    dynamicKeysList.forEach(key => {
      const val = dataObj[key] !== undefined ? dataObj[key] : legacyMap[key];
      row[key] = (val !== undefined && val !== null && String(val).trim() !== '') ? String(val) : '-';
    });

    row['Puntaje Trivia'] = `${score}/${totalQuestions}`;
    row['Porcentaje (%)'] = `${percentage}%`;

    return row;
  });

  // 3. Crear hoja de trabajo (Worksheet)
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);

  // 4. Calcular ancho automático perfecto de columnas para que no se corten datos
  if (dataToExport.length > 0) {
    const headers = Object.keys(dataToExport[0]);
    const colWidths = headers.map(header => {
      let maxLen = header.length;
      dataToExport.forEach(row => {
        const valStr = String(row[header] || '');
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: Math.max(maxLen + 4, 12) }; // Ancho con margen de espacio
    });
    worksheet['!cols'] = colWidths;
  }

  // 5. Crear libro de trabajo (Workbook) y descargar
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads NOVUS Stand");

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `NOVUS_Leads_Stand_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
  return true;
};

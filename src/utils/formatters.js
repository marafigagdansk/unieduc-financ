/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * @param {number|string} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
}

/**
 * Formata uma data ISO (YYYY-MM-DD) para DD/MM/AAAA.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/**
 * Formata um timestamp ISO completo para data e hora locais em PT-BR.
 * @param {string} isoStr
 * @returns {string}
 */
export function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const parsed = new Date(isoStr);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
}

/**
 * Retorna a data local atual no formato YYYY-MM-DD.
 * @returns {string}
 */
export function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

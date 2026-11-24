export const TRANSACTION_TYPES = ['income', 'expense'];

export const AVAILABLE_CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Saúde',
  'Lazer',
  'Contas',
  'Educação',
  'Salário',
  'Investimentos',
  'Serviços',
  'Outros',
];

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Gera a lista inicial de transações de demonstração com datas relativas ao dia atual.
 * @param {Date} [referenceDate]
 * @returns {Array<object>}
 */
export function createSeedTransactions(referenceDate = new Date()) {
  const formatOffsetDate = (daysAgo) => {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - daysAgo);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const nowIso = referenceDate.toISOString();

  return [
    {
      id: '1',
      type: 'income',
      amount: 4800.0,
      description: 'Salário Mensal',
      category: 'Salário',
      date: formatOffsetDate(0),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: '2',
      type: 'expense',
      amount: 1250.0,
      description: 'Aluguel do Apartamento',
      category: 'Moradia',
      date: formatOffsetDate(0),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: '3',
      type: 'expense',
      amount: 480.5,
      description: 'Supermercado Mensal',
      category: 'Alimentação',
      date: formatOffsetDate(1),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: '4',
      type: 'expense',
      amount: 120.0,
      description: 'Conta de Energia',
      category: 'Contas',
      date: formatOffsetDate(2),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: '5',
      type: 'income',
      amount: 650.0,
      description: 'Projeto Freelance',
      category: 'Serviços',
      date: formatOffsetDate(3),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: '6',
      type: 'expense',
      amount: 89.9,
      description: 'Assinaturas de Streaming',
      category: 'Lazer',
      date: formatOffsetDate(4),
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

/**
 * Valida se uma string representa uma data válida no formato YYYY-MM-DD.
 * @param {unknown} dateStr
 * @returns {boolean}
 */
export function isValidIsoDate(dateStr) {
  if (typeof dateStr !== 'string' || !ISO_DATE_REGEX.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

/**
 * Valida e normaliza os dados de entrada de uma transação.
 * Retorna `{ valid: true, data }` ou `{ valid: false, error }`.
 * @param {object} payload
 * @returns {{ valid: boolean, data?: object, error?: string }}
 */
export function validateTransactionInput(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Dados da transação inválidos.' };
  }

  if (!TRANSACTION_TYPES.includes(payload.type)) {
    return { valid: false, error: 'O tipo da transação deve ser "income" (Entrada) ou "expense" (Gasto).' };
  }

  const parsedAmount = Number(payload.amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return { valid: false, error: 'Por favor, insira um valor válido maior que zero.' };
  }

  const description = typeof payload.description === 'string' ? payload.description.trim() : '';
  if (!description) {
    return { valid: false, error: 'A descrição do lançamento é obrigatória.' };
  }

  if (description.length > 120) {
    return { valid: false, error: 'A descrição deve ter no máximo 120 caracteres.' };
  }

  if (!isValidIsoDate(payload.date)) {
    return { valid: false, error: 'Informe uma data válida no formato AAAA-MM-DD.' };
  }

  const rawCategory = typeof payload.category === 'string' ? payload.category.trim() : '';
  const defaultCategory = payload.type === 'income' ? 'Salário' : 'Outros';

  return {
    valid: true,
    data: {
      type: payload.type,
      amount: Math.round(parsedAmount * 100) / 100,
      description,
      category: rawCategory || defaultCategory,
      date: payload.date,
    },
  };
}

/**
 * Valida uma lista completa importada de um arquivo JSON.
 * Aceita um array direto ou um objeto `{ transactions: [...] }`.
 * @param {unknown} rawJson
 * @returns {{ valid: boolean, data?: Array<object>, error?: string }}
 */
export function validateImportedTransactions(rawJson) {
  const list = Array.isArray(rawJson)
    ? rawJson
    : rawJson && typeof rawJson === 'object' && Array.isArray(rawJson.transactions)
      ? rawJson.transactions
      : null;

  if (!list) {
    return {
      valid: false,
      error: 'O arquivo JSON deve conter uma lista de transações ou um objeto com a propriedade "transactions".',
    };
  }

  const nowIso = new Date().toISOString();
  const seenIds = new Set();
  const normalized = [];

  for (let index = 0; index < list.length; index++) {
    const item = list[index];
    const validation = validateTransactionInput(item);
    if (!validation.valid) {
      return {
        valid: false,
        error: `Registro #${index + 1} inválido: ${validation.error}`,
      };
    }

    let id = item.id !== undefined && item.id !== null ? String(item.id).trim() : '';
    if (!id || seenIds.has(id)) {
      id = `${Date.now()}-${index + 1}`;
    }
    seenIds.add(id);

    normalized.push({
      id,
      ...validation.data,
      createdAt: typeof item.createdAt === 'string' && item.createdAt ? item.createdAt : nowIso,
      updatedAt: typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : nowIso,
    });
  }

  return { valid: true, data: normalized };
}

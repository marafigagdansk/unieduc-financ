/**
 * Calcula totais consolidados (entradas, saídas, saldo líquido e contagens).
 * @param {Array<object>} transactions
 * @returns {{ income: number, expense: number, balance: number, incomeCount: number, expenseCount: number }}
 */
export function calculateTotals(transactions) {
  let income = 0;
  let expense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      income += amount;
      incomeCount++;
    } else if (tx.type === 'expense') {
      expense += amount;
      expenseCount++;
    }
  }

  const balance = income - expense;

  return {
    income: Math.round(income * 100) / 100,
    expense: Math.round(expense * 100) / 100,
    balance: Math.round(balance * 100) / 100,
    incomeCount,
    expenseCount,
  };
}

/**
 * Agrupa apenas as despesas por categoria em ordem decrescente de valor,
 * calculando o percentual relativo ao total de gastos.
 * @param {Array<object>} transactions
 * @returns {Array<{ category: string, total: number, percentage: number }>}
 */
export function getExpensesByCategory(transactions) {
  const categoryTotals = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    const category = tx.category || 'Outros';
    const amount = Number(tx.amount) || 0;
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    totalExpense += amount;
  }

  return Object.keys(categoryTotals)
    .map((category) => {
      const total = Math.round(categoryTotals[category] * 100) / 100;
      const percentage = totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0;
      return { category, total, percentage };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Ordena transações da mais recente para a mais antiga por data,
 * usando createdAt e ID numérico como critérios de desempate.
 * @param {Array<object>} transactions
 * @returns {Array<object>}
 */
export function sortTransactionsDesc(transactions) {
  return [...transactions].sort((a, b) => {
    const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));
    if (dateCompare !== 0) return dateCompare;

    if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
      return String(b.createdAt).localeCompare(String(a.createdAt));
    }

    const numDiff = (Number(b.id) || 0) - (Number(a.id) || 0);
    if (numDiff !== 0) return numDiff;

    return String(b.id || '').localeCompare(String(a.id || ''));
  });
}

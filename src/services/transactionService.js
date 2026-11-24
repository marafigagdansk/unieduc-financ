export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/transactions').replace(/\/$/, '');
export const IS_EXTERNAL_API = /^https?:\/\//i.test(API_BASE_URL);

/**
 * Executa uma chamada HTTP JSON padronizada com tratamento de falhas de rede e erro da API.
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function requestJson(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    const hint = IS_EXTERNAL_API
      ? `Verifique se a API Spring Boot está em execução em ${API_BASE_URL}.`
      : 'Verifique se o servidor Vite está em execução.';
    throw new Error(`Não foi possível conectar à API de dados. ${hint}`);
  }

  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const message =
      payload?.message || `Erro HTTP ${response.status} ao comunicar com a API de dados.`;
    throw new Error(message);
  }

  return payload;
}

export const transactionService = {
  /**
   * Lista todas as transações persistidas (GET).
   */
  fetchAll() {
    return requestJson('');
  },

  /**
   * Busca os detalhes de uma transação individual pelo ID (GET /:id).
   * @param {string|number} id
   */
  fetchById(id) {
    return requestJson(`/${encodeURIComponent(id)}`);
  },

  /**
   * Cadastra uma nova transação (POST).
   * @param {object} transactionData
   */
  create(transactionData) {
    return requestJson('', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  /**
   * Atualiza uma transação existente (PUT /:id).
   * @param {string|number} id
   * @param {object} transactionData
   */
  update(id, transactionData) {
    return requestJson(`/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  },

  /**
   * Remove uma transação pelo ID (DELETE /:id).
   * @param {string|number} id
   */
  remove(id) {
    return requestJson(`/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Substitui os registros atuais pelos importados de um arquivo JSON externo.
   * @param {Array<object>|object} rawData
   */
  importJson(rawData) {
    return requestJson('/import', {
      method: 'POST',
      body: JSON.stringify(rawData),
    });
  },

  /**
   * Restaura os dados iniciais de demonstração.
   */
  resetToSeed() {
    return requestJson('/reset', {
      method: 'POST',
    });
  },
};

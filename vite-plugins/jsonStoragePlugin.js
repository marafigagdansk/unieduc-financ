import fs from 'node:fs/promises';
import path from 'node:path';
import {
  createSeedTransactions,
  validateImportedTransactions,
  validateTransactionInput,
} from '../shared/transactionsModel.js';

const DEFAULT_DATA_PATH = path.resolve(process.cwd(), 'data', 'transactions.json');
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

/**
 * Envia uma resposta JSON padronizada.
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {unknown} payload
 */
function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

/**
 * Lê e faz o parse do corpo JSON de uma requisição HTTP.
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<unknown>}
 */
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;

    req.on('data', (chunk) => {
      totalLength += chunk.length;
      if (totalLength > MAX_BODY_BYTES) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', reject);
  });
}

/**
 * Cria o repositório de arquivo JSON com serialização sequencial de escrita
 * para evitar corrupção em requisições concorrentes.
 * @param {string} filePath
 */
export function createJsonRepository(filePath = DEFAULT_DATA_PATH) {
  let writeChain = Promise.resolve();

  const ensureFileExists = async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    try {
      await fs.access(filePath);
    } catch {
      const seed = createSeedTransactions();
      await fs.writeFile(filePath, `${JSON.stringify(seed, null, 2)}\n`, 'utf-8');
    }
  };

  const readAll = async () => {
    await ensureFileExists();
    const raw = await fs.readFile(filePath, 'utf-8');
    if (!raw.trim()) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('O arquivo data/transactions.json não contém um array JSON válido.');
    }
    return parsed;
  };

  const writeAll = (transactions) => {
    writeChain = writeChain.then(async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, `${JSON.stringify(transactions, null, 2)}\n`, 'utf-8');
    });
    return writeChain;
  };

  return { readAll, writeAll };
}

/**
 * Cria o middleware HTTP que manipula as rotas /api/transactions diretamente
 * no arquivo JSON local do projeto.
 * @param {{ dataFilePath?: string }} [options]
 */
export function jsonStoragePlugin(options = {}) {
  const repository = createJsonRepository(options.dataFilePath || DEFAULT_DATA_PATH);

  const attachMiddleware = (middlewares) => {
    middlewares.use('/api/transactions', async (req, res, next) => {
      const requestPath = (req.url || '/').split('?')[0];
      const method = (req.method || 'GET').toUpperCase();

      try {
        if (method === 'GET' && (requestPath === '/' || requestPath === '')) {
          const transactions = await repository.readAll();
          sendJson(res, 200, transactions);
          return;
        }

        if (requestPath === '/reset' || requestPath === '/import') {
          if (method !== 'POST') {
            sendJson(res, 405, { message: 'Método HTTP não permitido.' });
            return;
          }

          if (requestPath === '/reset') {
            const seed = createSeedTransactions();
            await repository.writeAll(seed);
            sendJson(res, 200, seed);
            return;
          }

          const body = await readRequestBody(req);
          const validation = validateImportedTransactions(body);
          if (!validation.valid) {
            sendJson(res, 400, { message: validation.error });
            return;
          }
          await repository.writeAll(validation.data);
          sendJson(res, 200, validation.data);
          return;
        }

        if (method === 'POST' && (requestPath === '/' || requestPath === '')) {
          const body = await readRequestBody(req);
          const validation = validateTransactionInput(body);
          if (!validation.valid) {
            sendJson(res, 400, { message: validation.error });
            return;
          }

          const transactions = await repository.readAll();
          const existingIds = new Set(transactions.map((item) => String(item.id)));
          let nextId = Date.now();
          while (existingIds.has(String(nextId))) {
            nextId += 1;
          }

          const nowIso = new Date().toISOString();
          const newTransaction = {
            id: String(nextId),
            ...validation.data,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          const updatedList = [newTransaction, ...transactions];
          await repository.writeAll(updatedList);
          sendJson(res, 201, newTransaction);
          return;
        }

        const idMatch = requestPath.match(/^\/([^/]+)$/);
        if (!idMatch) {
          next();
          return;
        }

        const targetId = decodeURIComponent(idMatch[1]);
        const transactions = await repository.readAll();
        const existingIndex = transactions.findIndex((item) => String(item.id) === targetId);

        if (existingIndex === -1) {
          sendJson(res, 404, { message: 'Lançamento não encontrado.' });
          return;
        }

        if (method === 'GET') {
          sendJson(res, 200, transactions[existingIndex]);
          return;
        }

        if (method === 'PUT') {
          const body = await readRequestBody(req);
          const validation = validateTransactionInput(body);
          if (!validation.valid) {
            sendJson(res, 400, { message: validation.error });
            return;
          }

          const existing = transactions[existingIndex];
          const updatedTransaction = {
            ...existing,
            ...validation.data,
            id: existing.id,
            updatedAt: new Date().toISOString(),
          };

          const updatedList = [...transactions];
          updatedList[existingIndex] = updatedTransaction;
          await repository.writeAll(updatedList);
          sendJson(res, 200, updatedTransaction);
          return;
        }

        if (method === 'DELETE') {
          const updatedList = transactions.filter((item) => String(item.id) !== targetId);
          await repository.writeAll(updatedList);
          sendJson(res, 200, { deletedId: targetId });
          return;
        }

        sendJson(res, 405, { message: 'Método HTTP não permitido.' });
      } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_JSON') {
          sendJson(res, 400, { message: 'Corpo da requisição não contém JSON válido.' });
          return;
        }
        if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { message: 'O arquivo JSON enviado excede o limite de 1 MB.' });
          return;
        }

        console.error('[jsonStoragePlugin] Erro interno:', error);
        sendJson(res, 500, {
          message: 'Erro ao ler ou gravar os dados no arquivo JSON local.',
        });
      }
    });
  };

  return {
    name: 'json-storage-plugin',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

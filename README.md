# Finanças Simples — Gestão Financeira Pessoal (Frontend Web)

Aplicação web responsiva para controle financeiro pessoal desenvolvida em **Vue.js 3 + Vite**, baseada na prototipagem **Gestão Financeira Pessoal - Vue.js** e alinhada aos requisitos de usabilidade, CRUD e integração REST da **Atividade Avaliativa A3 (UNICURITIBA)**.

---

## Integrantes da Equipe

- **[Preencher Nome Completo — RA]**
- **[Preencher Nome Completo — RA]**

---

## Tecnologias Utilizadas

- **Vue.js 3** (`<script setup>`, Composition API)
- **Vite** (bundler e servidor de desenvolvimento)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Apache ECharts** (gráfico interativo de gastos por categoria)
- **Lucide Icons** (`lucide-vue-next`)

---

## Configuração da API (`.env`) e Porta do Backend Spring Boot

O front-end utiliza a variável `VITE_API_URL` definida no arquivo `.env` na raiz deste projeto (baseado em [`.env.example`](./.env.example)):

```env
VITE_API_URL=http://localhost:8080/api/transactions
```

- **Porta padrão da API Spring Boot:** `8080` (`http://localhost:8080/api/transactions`).
- A porta da API é configurável no arquivo `.env` do projeto Spring Boot através da variável `SERVER_PORT` (padrão `8080`).
- Caso altere `SERVER_PORT` no `.env` do Spring Boot (por exemplo, para `8081`), atualize também `VITE_API_URL` no `.env` deste projeto (`http://localhost:8081/api/transactions`) e reinicie o servidor `npm run dev`.
- **Fallback local (opcional):** Caso `VITE_API_URL` seja removida ou deixada vazia, a aplicação utiliza `/api/transactions` atendido pelo middleware local do Vite em [`data/transactions.json`](./data/transactions.json).

---

## Funcionalidades Implementadas

- **Dashboard / Painel de Resumo**: Saldo Atual, Total de Entradas (com quantidade) e Total de Gastos (com quantidade).
- **Lançamento Rápido (`POST`)**: Cadastro ágil alternando entre *Gasto* e *Entrada*, com validação de campos e envio com `Enter`.
- **Visualização Detalhada (`GET /:id`)**: Modal individual com informações completas ao clicar em um registro ou no ícone de visualização.
- **Edição (`PUT /:id`)**: Modal de edição para atualizar tipo, valor, data, descrição e categoria.
- **Exclusão (`DELETE /:id`)**: Remoção com diálogo de confirmação prévia.
- **Gráfico de Gastos por Categoria**: Distribuição proporcional com ECharts e resumo das principais categorias.
- **Busca e Filtros**: Pesquisa por descrição ou categoria, filtros por *Todas*, *Entradas* e *Gastos*, ordenação cronológica decrescente.
- **Importar / Exportar JSON e Restaurar Dados**:
  - **Importar JSON** (`POST /import`): envia um arquivo JSON validado para substituir os registros na API/banco SQL.
  - **Exportar JSON**: baixa um arquivo `.json` formatado com os lançamentos atuais.
  - **Restaurar Dados de Exemplo** (`POST /reset`).
- **Feedback e Tratamento de Erros**: Notificações *toast* de sucesso/erro e banner de indisponibilidade da API com botão para tentar reconectar.

---

## Como Executar o Projeto

### Pré-requisitos
- **Node.js** (v18+ recomendado) e **npm**.
- API **Finanças Simples (Spring Boot + MySQL)** em execução na porta configurada em `SERVER_PORT` (padrão `8080`).

### Passo a Passo

1. Confira o arquivo `.env` na raiz deste projeto (ou copie `.env.example` para `.env`):
   ```env
   VITE_API_URL=http://localhost:8080/api/transactions
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse o endereço exibido no terminal (geralmente `http://localhost:5173`).

---

## Estrutura de Arquivos Principais

- `.env` / `.env.example` — Aponta `VITE_API_URL` para a API Spring Boot.
- `src/services/transactionService.js` — Camada HTTP REST (`GET`, `POST`, `PUT`, `DELETE`, `/import`, `/reset`).
- `shared/transactionsModel.js` — Regras de validação e normalização de lançamentos.
- `src/utils/financeCalculations.js` — Cálculos puros de totais, agrupamento por categoria e ordenação.
- `src/components/` — Componentes modulares da interface (`AppHeader`, `SummaryCards`, `TransactionForm`, `CategoryChart`, `TransactionTable`, modais e notificações).
- `vite-plugins/jsonStoragePlugin.js` e `data/transactions.json` — Fallback local caso `VITE_API_URL` não esteja definida.

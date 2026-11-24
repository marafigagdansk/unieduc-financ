<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { AlertTriangle, RefreshCw } from 'lucide-vue-next';
import { validateImportedTransactions } from '../shared/transactionsModel.js';
import AppHeader from './components/AppHeader.vue';
import CategoryChart from './components/CategoryChart.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import SummaryCards from './components/SummaryCards.vue';
import ToastContainer from './components/ToastContainer.vue';
import TransactionDetailModal from './components/TransactionDetailModal.vue';
import TransactionEditModal from './components/TransactionEditModal.vue';
import TransactionForm from './components/TransactionForm.vue';
import TransactionTable from './components/TransactionTable.vue';
import { useToast } from './composables/useToast.js';
import {
  API_BASE_URL,
  IS_EXTERNAL_API,
  transactionService,
} from './services/transactionService.js';
import {
  calculateTotals,
  getExpensesByCategory,
  sortTransactionsDesc,
} from './utils/financeCalculations.js';
import { getTodayIsoDate } from './utils/formatters.js';

const toast = useToast();

const transactions = ref([]);
const loading = ref(true);
const submitting = ref(false);
const savingEdit = ref(false);
const confirmingAction = ref(false);
const apiError = ref('');

const searchQuery = ref('');
const filterType = ref('all');

const selectedTransaction = ref(null);
const editingTransaction = ref(null);
const confirmState = ref({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  variant: 'danger',
  action: null,
});

const totals = computed(() => calculateTotals(transactions.value));
const expenseCategoriesData = computed(() => getExpensesByCategory(transactions.value));

const filteredTransactions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return transactions.value.filter((tx) => {
    const matchesType = filterType.value === 'all' || tx.type === filterType.value;
    if (!matchesType) return false;

    if (!query) return true;
    const descMatch = (tx.description || '').toLowerCase().includes(query);
    const catMatch = (tx.category || '').toLowerCase().includes(query);
    return descMatch || catMatch;
  });
});

const sortedAndFilteredTransactions = computed(() =>
  sortTransactionsDesc(filteredTransactions.value)
);

const loadTransactions = async () => {
  loading.value = true;
  apiError.value = '';
  try {
    const data = await transactionService.fetchAll();
    transactions.value = Array.isArray(data) ? data : [];
  } catch (error) {
    apiError.value = error.message;
    toast.error(error.message);
  } finally {
    loading.value = false;
  }
};

const handleCreateTransaction = async (payload, onSuccessReset) => {
  submitting.value = true;
  try {
    const created = await transactionService.create(payload);
    transactions.value.unshift(created);
    onSuccessReset?.();
    toast.success(
      payload.type === 'income'
        ? 'Entrada registrada com sucesso!'
        : 'Gasto registrado com sucesso!'
    );
  } catch (error) {
    toast.error(error.message);
  } finally {
    submitting.value = false;
  }
};

const handleViewTransaction = async (tx) => {
  selectedTransaction.value = tx;
  try {
    const fresh = await transactionService.fetchById(tx.id);
    if (selectedTransaction.value?.id === tx.id) {
      selectedTransaction.value = fresh;
    }
  } catch {
    // Mantém os dados já carregados em tela caso a consulta individual falhe pontualmente
  }
};

const openEditModal = (tx) => {
  selectedTransaction.value = null;
  editingTransaction.value = tx;
};

const handleSaveEdit = async (id, payload) => {
  savingEdit.value = true;
  try {
    const updated = await transactionService.update(id, payload);
    transactions.value = transactions.value.map((item) =>
      String(item.id) === String(id) ? updated : item
    );
    editingTransaction.value = null;
    toast.success('Lançamento atualizado com sucesso!');
  } catch (error) {
    toast.error(error.message);
  } finally {
    savingEdit.value = false;
  }
};

const openConfirmDialog = (config) => {
  confirmState.value = {
    open: true,
    title: config.title,
    message: config.message,
    confirmLabel: config.confirmLabel || 'Confirmar',
    variant: config.variant || 'danger',
    action: config.action,
  };
};

const closeConfirmDialog = () => {
  if (confirmingAction.value) return;
  confirmState.value.open = false;
  confirmState.value.action = null;
};

const executeConfirmDialog = async () => {
  if (!confirmState.value.action) return;
  confirmingAction.value = true;
  try {
    await confirmState.value.action();
    confirmState.value.open = false;
    confirmState.value.action = null;
  } finally {
    confirmingAction.value = false;
  }
};

const requestDeleteTransaction = (tx) => {
  openConfirmDialog({
    title: 'Excluir lançamento?',
    message: `Tem certeza que deseja remover "${tx.description}"? Essa ação não pode ser desfeita.`,
    confirmLabel: 'Excluir',
    variant: 'danger',
    action: async () => {
      try {
        await transactionService.remove(tx.id);
        transactions.value = transactions.value.filter(
          (item) => String(item.id) !== String(tx.id)
        );
        if (selectedTransaction.value?.id === tx.id) {
          selectedTransaction.value = null;
        }
        toast.success('Lançamento excluído com sucesso.');
      } catch (error) {
        toast.error(error.message);
      }
    },
  });
};

const requestResetData = () => {
  openConfirmDialog({
    title: 'Restaurar dados de exemplo?',
    message:
      'Seus lançamentos atuais serão substituídos pelos registros iniciais de demonstração.',
    confirmLabel: 'Restaurar Dados',
    variant: 'danger',
    action: async () => {
      try {
        const seeded = await transactionService.resetToSeed();
        transactions.value = seeded;
        toast.info('Dados de exemplo restaurados com sucesso.');
      } catch (error) {
        toast.error(error.message);
      }
    },
  });
};

const handleExportJson = () => {
  try {
    const content = JSON.stringify(transactions.value, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas-simples-${getTodayIsoDate()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Arquivo JSON exportado com sucesso!');
  } catch {
    toast.error('Não foi possível exportar o arquivo JSON.');
  }
};

const handleImportFile = async (file) => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const validation = validateImportedTransactions(parsed);

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    openConfirmDialog({
      title: 'Importar arquivo JSON?',
      message: `Foram encontrados ${validation.data.length} lançamento(s) válido(s) em "${file.name}". Deseja substituir os lançamentos atuais?`,
      confirmLabel: 'Importar e Salvar',
      variant: 'primary',
      action: async () => {
        try {
          const saved = await transactionService.importJson(validation.data);
          transactions.value = saved;
          toast.success(`${saved.length} lançamento(s) importado(s) com sucesso!`);
        } catch (error) {
          toast.error(error.message);
        }
      },
    });
  } catch {
    toast.error('O arquivo selecionado não é um JSON válido.');
  }
};

const handleKeyDown = (event) => {
  if (event.key !== 'Escape') return;
  if (confirmState.value.open) {
    closeConfirmDialog();
  } else if (editingTransaction.value && !savingEdit.value) {
    editingTransaction.value = null;
  } else if (selectedTransaction.value) {
    selectedTransaction.value = null;
  }
};

onMounted(() => {
  loadTransactions();
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader
      :busy="loading || submitting || savingEdit || confirmingAction"
      :has-transactions="transactions.length > 0"
      @export-json="handleExportJson"
      @import-file="handleImportFile"
      @request-reset="requestResetData"
    />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
      <!-- Banner de erro de comunicação com o backend/JSON -->
      <div
        v-if="apiError"
        role="alert"
        class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800"
      >
        <div class="flex items-start gap-3 text-xs">
          <AlertTriangle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-sm text-rose-900">Falha ao acessar os dados</p>
            <p class="mt-0.5">{{ apiError }}</p>
          </div>
        </div>
        <button
          type="button"
          class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition"
          @click="loadTransactions"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          Tentar novamente
        </button>
      </div>

      <!-- 1. Painel de Totais no Topo -->
      <SummaryCards :totals="totals" />

      <!-- 2. Grade Principal: Formulário Rápido + Gráfico de Gastos por Categoria -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-7">
          <TransactionForm :submitting="submitting" @submit="handleCreateTransaction" />
        </div>

        <div class="lg:col-span-5 h-full">
          <CategoryChart :categories="expenseCategoriesData" />
        </div>
      </div>

      <!-- 3. Histórico de Transações -->
      <TransactionTable
        v-model:search-query="searchQuery"
        v-model:filter-type="filterType"
        :transactions="sortedAndFilteredTransactions"
        :total-count="transactions.length"
        :loading="loading"
        @view="handleViewTransaction"
        @edit="openEditModal"
        @delete="requestDeleteTransaction"
      />
    </main>

    <footer class="mt-auto py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
      <template v-if="IS_EXTERNAL_API">
        Finanças Simples • Conectado à API REST (<code>{{ API_BASE_URL }}</code>).
      </template>
      <template v-else>
        Finanças Simples • Dados persistidos no arquivo JSON local (<code>data/transactions.json</code>).
      </template>
    </footer>

    <!-- Modais e Feedback -->
    <TransactionDetailModal
      :transaction="selectedTransaction"
      @close="selectedTransaction = null"
      @edit="openEditModal"
      @delete="requestDeleteTransaction"
    />

    <TransactionEditModal
      :transaction="editingTransaction"
      :saving="savingEdit"
      @close="editingTransaction = null"
      @save="handleSaveEdit"
    />

    <ConfirmDialog
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-label="confirmState.confirmLabel"
      :variant="confirmState.variant"
      :busy="confirmingAction"
      @confirm="executeConfirmDialog"
      @cancel="closeConfirmDialog"
    />

    <ToastContainer />
  </div>
</template>

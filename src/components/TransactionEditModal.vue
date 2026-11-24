<script setup>
import { reactive, ref, watch } from 'vue';
import { Loader2, Save, X } from 'lucide-vue-next';
import { validateTransactionInput } from '../../shared/transactionsModel.js';
import { DEFAULT_CATEGORY_BY_TYPE } from '../constants/categories.js';
import TransactionFormFields from './TransactionFormFields.vue';
import TransactionTypeToggle from './TransactionTypeToggle.vue';

const props = defineProps({
  transaction: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save']);

const formError = ref('');

const form = reactive({
  type: 'expense',
  amount: '',
  description: '',
  category: DEFAULT_CATEGORY_BY_TYPE.expense,
  date: '',
});

watch(
  () => props.transaction,
  (tx) => {
    formError.value = '';
    if (!tx) return;
    form.type = tx.type || 'expense';
    form.amount = Number(tx.amount) || '';
    form.description = tx.description || '';
    form.category = tx.category || DEFAULT_CATEGORY_BY_TYPE[form.type];
    form.date = tx.date || '';
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (!props.transaction) return;
  formError.value = '';

  const validation = validateTransactionInput(form);
  if (!validation.valid) {
    formError.value = validation.error;
    return;
  }

  emit('save', props.transaction.id, validation.data);
};
</script>

<template>
  <div
    v-if="transaction"
    class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-modal-title"
    @click.self="!saving && $emit('close')"
  >
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 id="edit-modal-title" class="text-base font-bold text-slate-900">
            Editar Lançamento
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Atualize os dados do registro e salve as alterações
          </p>
        </div>

        <button
          type="button"
          :disabled="saving"
          aria-label="Fechar modal de edição"
          class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form class="mt-4 space-y-4" novalidate @submit.prevent="handleSubmit">
        <div>
          <span class="block text-xs font-semibold text-slate-700 mb-1.5">Tipo de Transação</span>
          <TransactionTypeToggle v-model="form.type" :disabled="saving" />
        </div>

        <TransactionFormFields
          v-model:amount="form.amount"
          v-model:date="form.date"
          v-model:description="form.description"
          v-model:category="form.category"
          :error-message="formError"
          :disabled="saving"
          id-prefix="edit"
        />

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            :disabled="saving"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
            @click="$emit('close')"
          >
            Cancelar
          </button>

          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>{{ saving ? 'Salvando...' : 'Salvar Alterações' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { Loader2, Plus } from 'lucide-vue-next';
import { validateTransactionInput } from '../../shared/transactionsModel.js';
import { DEFAULT_CATEGORY_BY_TYPE } from '../constants/categories.js';
import { getTodayIsoDate } from '../utils/formatters.js';
import TransactionFormFields from './TransactionFormFields.vue';
import TransactionTypeToggle from './TransactionTypeToggle.vue';

const props = defineProps({
  submitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit']);

const fieldsRef = ref(null);
const formError = ref('');

const form = reactive({
  type: 'expense',
  amount: '',
  description: '',
  category: DEFAULT_CATEGORY_BY_TYPE.expense,
  date: getTodayIsoDate(),
});

const handleTypeChange = (nextType) => {
  const prevDefault = DEFAULT_CATEGORY_BY_TYPE[form.type];
  form.type = nextType;
  if (form.category === prevDefault) {
    form.category = DEFAULT_CATEGORY_BY_TYPE[nextType];
  }
  formError.value = '';
};

const handleSubmit = () => {
  formError.value = '';

  const validation = validateTransactionInput(form);
  if (!validation.valid) {
    formError.value = validation.error;
    return;
  }

  emit('submit', validation.data, () => {
    form.amount = '';
    form.description = '';
    fieldsRef.value?.focusAmount();
  });
};
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100"
    >
      <div>
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Novo Lançamento Rápido</span>
          <span
            class="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
          >
            Ágil
          </span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Registre entradas ou despesas em instantes
        </p>
      </div>

      <TransactionTypeToggle
        :model-value="form.type"
        :disabled="props.submitting"
        class="sm:w-auto"
        @update:model-value="handleTypeChange"
      />
    </div>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <TransactionFormFields
        ref="fieldsRef"
        v-model:amount="form.amount"
        v-model:date="form.date"
        v-model:description="form.description"
        v-model:category="form.category"
        :error-message="formError"
        :disabled="props.submitting"
        id-prefix="quick"
      />

      <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs text-slate-400">
          Pressione
          <kbd
            class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono text-[10px]"
          >
            Enter
          </kbd>
          para salvar
        </span>

        <button
          type="submit"
          :disabled="props.submitting"
          :class="
            form.type === 'expense'
              ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
              : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
          "
          class="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center gap-2 disabled:opacity-60"
        >
          <Loader2 v-if="props.submitting" class="w-4 h-4 animate-spin" />
          <Plus v-else class="w-4 h-4" />
          <span>
            {{
              props.submitting
                ? 'Salvando...'
                : `Adicionar ${form.type === 'expense' ? 'Gasto' : 'Entrada'}`
            }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

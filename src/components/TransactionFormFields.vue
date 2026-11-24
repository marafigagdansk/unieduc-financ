<script setup>
import { ref } from 'vue';
import { AlertCircle } from 'lucide-vue-next';
import { AVAILABLE_CATEGORIES } from '../constants/categories.js';

defineProps({
  errorMessage: {
    type: String,
    default: '',
  },
  idPrefix: {
    type: String,
    default: 'tx',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const amount = defineModel('amount', { type: [Number, String], default: '' });
const date = defineModel('date', { type: String, default: '' });
const description = defineModel('description', { type: String, default: '' });
const category = defineModel('category', { type: String, default: '' });

const amountInputRef = ref(null);

defineExpose({
  focusAmount: () => amountInputRef.value?.focus(),
});
</script>

<template>
  <div class="space-y-4">
    <!-- Mensagem de Validação de Erro -->
    <div
      v-if="errorMessage"
      role="alert"
      class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Valor -->
      <div>
        <label :for="`${idPrefix}-amount`" class="block text-xs font-semibold text-slate-700 mb-1">
          Valor (R$) <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-semibold text-slate-400 pointer-events-none"
          >
            R$
          </span>
          <input
            :id="`${idPrefix}-amount`"
            ref="amountInputRef"
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            :disabled="disabled"
            required
            class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
          />
        </div>
      </div>

      <!-- Data -->
      <div>
        <label :for="`${idPrefix}-date`" class="block text-xs font-semibold text-slate-700 mb-1">
          Data <span class="text-rose-500">*</span>
        </label>
        <input
          :id="`${idPrefix}-date`"
          v-model="date"
          type="date"
          :disabled="disabled"
          required
          class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Descrição -->
      <div>
        <label
          :for="`${idPrefix}-description`"
          class="block text-xs font-semibold text-slate-700 mb-1"
        >
          Descrição <span class="text-rose-500">*</span>
        </label>
        <input
          :id="`${idPrefix}-description`"
          v-model.trim="description"
          type="text"
          maxlength="120"
          placeholder="Ex: Almoço, Salário, Mercado..."
          :disabled="disabled"
          required
          class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
        />
      </div>

      <!-- Categoria -->
      <div>
        <label
          :for="`${idPrefix}-category`"
          class="block text-xs font-semibold text-slate-700 mb-1"
        >
          Categoria
        </label>
        <select
          :id="`${idPrefix}-category`"
          v-model="category"
          :disabled="disabled"
          class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
        >
          <option v-for="cat in AVAILABLE_CATEGORIES" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowDown, ArrowUp, Scale } from 'lucide-vue-next';
import { formatCurrency } from '../utils/formatters.js';

defineProps({
  totals: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Resumo financeiro">
    <!-- Saldo Atual -->
    <div
      class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Saldo Atual
        </span>
        <div
          class="p-2 rounded-xl"
          :class="
            totals.balance >= 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          "
        >
          <Scale class="w-5 h-5" />
        </div>
      </div>
      <div class="mt-2">
        <h2
          class="text-2xl font-bold tracking-tight tabular-nums"
          :class="totals.balance >= 0 ? 'text-slate-900' : 'text-rose-600'"
        >
          {{ formatCurrency(totals.balance) }}
        </h2>
        <p class="text-xs text-slate-400 mt-1">Saldo líquido acumulado</p>
      </div>
      <div
        class="absolute bottom-0 left-0 right-0 h-1"
        :class="totals.balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'"
      ></div>
    </div>

    <!-- Total de Entradas -->
    <div
      class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Total de Entradas
        </span>
        <div class="p-2 rounded-xl bg-emerald-50 text-emerald-600">
          <ArrowUp class="w-5 h-5" />
        </div>
      </div>
      <div class="mt-2">
        <h2 class="text-2xl font-bold text-emerald-600 tracking-tight tabular-nums">
          + {{ formatCurrency(totals.income) }}
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          {{ totals.incomeCount }} entrada(s) registrada(s)
        </p>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400"></div>
    </div>

    <!-- Total de Gastos -->
    <div
      class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-rose-700">
          Total de Gastos
        </span>
        <div class="p-2 rounded-xl bg-rose-50 text-rose-600">
          <ArrowDown class="w-5 h-5" />
        </div>
      </div>
      <div class="mt-2">
        <h2 class="text-2xl font-bold text-rose-600 tracking-tight tabular-nums">
          - {{ formatCurrency(totals.expense) }}
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          {{ totals.expenseCount }} despesa(s) registrada(s)
        </p>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-rose-400"></div>
    </div>
  </section>
</template>

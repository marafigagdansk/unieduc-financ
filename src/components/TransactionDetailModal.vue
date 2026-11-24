<script setup>
import { ArrowDown, ArrowUp, Calendar, Clock, Hash, Pencil, Tag, Trash2, X } from 'lucide-vue-next';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters.js';

defineProps({
  transaction: {
    type: Object,
    default: null,
  },
});

defineEmits(['close', 'edit', 'delete']);
</script>

<template>
  <div
    v-if="transaction"
    class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="detail-modal-title"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
            :class="transaction.type === 'income' ? 'badge-in' : 'badge-out'"
          >
            <ArrowUp v-if="transaction.type === 'income'" class="w-3.5 h-3.5" />
            <ArrowDown v-else class="w-3.5 h-3.5" />
            {{ transaction.type === 'income' ? 'Entrada' : 'Gasto' }}
          </span>
          <h3 id="detail-modal-title" class="text-lg font-bold text-slate-900 leading-snug">
            {{ transaction.description }}
          </h3>
        </div>

        <button
          type="button"
          aria-label="Fechar detalhes"
          class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="my-5 space-y-4">
        <div
          class="p-4 rounded-xl border"
          :class="
            transaction.type === 'income'
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-rose-50/70 border-rose-200'
          "
        >
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Valor do Lançamento
          </span>
          <p
            class="text-2xl font-extrabold mt-1 tabular-nums"
            :class="transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'"
          >
            {{ transaction.type === 'income' ? '+' : '-' }}
            {{ formatCurrency(transaction.amount) }}
          </p>
        </div>

        <dl class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <dt class="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <Tag class="w-3.5 h-3.5" />
              Categoria
            </dt>
            <dd class="text-slate-800 font-semibold">{{ transaction.category || 'Geral' }}</dd>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <dt class="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <Calendar class="w-3.5 h-3.5" />
              Data
            </dt>
            <dd class="text-slate-800 font-semibold tabular-nums">
              {{ formatDate(transaction.date) }}
            </dd>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <dt class="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <Hash class="w-3.5 h-3.5" />
              ID do Registro
            </dt>
            <dd class="text-slate-700 font-mono truncate">{{ transaction.id }}</dd>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <dt class="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <Clock class="w-3.5 h-3.5" />
              Atualizado em
            </dt>
            <dd class="text-slate-700 font-medium">
              {{ formatDateTime(transaction.updatedAt || transaction.createdAt) }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
          @click="$emit('delete', transaction)"
        >
          <Trash2 class="w-3.5 h-3.5" />
          Excluir
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            @click="$emit('close')"
          >
            Fechar
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
            @click="$emit('edit', transaction)"
          >
            <Pencil class="w-3.5 h-3.5" />
            Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

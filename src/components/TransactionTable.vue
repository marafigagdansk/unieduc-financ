<script setup>
import { ArrowDown, ArrowUp, ClipboardList, Eye, Pencil, Search, Trash2, X } from 'lucide-vue-next';
import { formatCurrency, formatDate } from '../utils/formatters.js';

defineProps({
  transactions: {
    type: Array,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  filterType: {
    type: String,
    default: 'all',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:searchQuery',
  'update:filterType',
  'view',
  'edit',
  'delete',
]);

const filterOptions = [
  { value: 'all', label: 'Todas', activeClass: 'bg-white font-semibold text-slate-900 shadow-sm' },
  {
    value: 'income',
    label: 'Entradas',
    activeClass: 'bg-white font-semibold text-emerald-700 shadow-sm',
  },
  {
    value: 'expense',
    label: 'Gastos',
    activeClass: 'bg-white font-semibold text-rose-700 shadow-sm',
  },
];

const clearFilters = () => {
  emit('update:searchQuery', '');
  emit('update:filterType', 'all');
};
</script>

<template>
  <section class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <div
      class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div>
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
          <span>Histórico de Transações</span>
          <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {{ transactions.length }} lançamento(s)
          </span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Ordenado por data decrescente (clique em um item para ver detalhes)
        </p>
      </div>

      <!-- Filtros Essenciais e Pesquisa Rápida -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="relative flex-1 sm:flex-initial">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            :value="searchQuery"
            type="text"
            placeholder="Buscar descrição..."
            aria-label="Buscar lançamentos por descrição ou categoria"
            class="w-full sm:w-52 text-xs px-3 py-1.5 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            @input="$emit('update:searchQuery', $event.target.value)"
          />
          <button
            v-if="searchQuery"
            type="button"
            aria-label="Limpar busca"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            @click="$emit('update:searchQuery', '')"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            :class="
              filterType === option.value
                ? option.activeClass
                : 'text-slate-600 hover:text-slate-900'
            "
            class="px-2.5 py-1 rounded-md transition"
            @click="$emit('update:filterType', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela de Transações -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr
            class="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100"
          >
            <th class="py-3 px-5">Tipo</th>
            <th class="py-3 px-4">Descrição</th>
            <th class="py-3 px-4">Categoria</th>
            <th class="py-3 px-4">Data</th>
            <th class="py-3 px-4 text-right">Valor</th>
            <th class="py-3 px-4 text-center w-32">Ações</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 text-sm">
          <tr
            v-if="loading && transactions.length === 0"
            class="text-center text-slate-400"
          >
            <td colspan="6" class="py-10 text-xs">Carregando lançamentos do arquivo JSON...</td>
          </tr>

          <tr
            v-for="tx in transactions"
            :key="tx.id"
            tabindex="0"
            title="Clique para visualizar detalhes"
            class="hover:bg-slate-50/80 transition-colors cursor-pointer focus:outline-none focus:bg-emerald-50/40"
            @click="$emit('view', tx)"
            @keydown.enter.self="$emit('view', tx)"
          >
            <td class="py-3 px-5 whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="tx.type === 'income' ? 'badge-in' : 'badge-out'"
              >
                <ArrowUp v-if="tx.type === 'income'" class="w-3.5 h-3.5" />
                <ArrowDown v-else class="w-3.5 h-3.5" />
                {{ tx.type === 'income' ? 'Entrada' : 'Gasto' }}
              </span>
            </td>

            <td class="py-3 px-4 font-medium text-slate-900 max-w-[240px] truncate">
              {{ tx.description }}
            </td>

            <td class="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
              <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                {{ tx.category || 'Geral' }}
              </span>
            </td>

            <td class="py-3 px-4 text-slate-500 text-xs whitespace-nowrap tabular-nums">
              {{ formatDate(tx.date) }}
            </td>

            <td
              class="py-3 px-4 text-right font-bold whitespace-nowrap tabular-nums"
              :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ tx.type === 'income' ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
            </td>

            <td class="py-3 px-4 text-center whitespace-nowrap" @click.stop>
              <div class="inline-flex items-center justify-center gap-1">
                <button
                  type="button"
                  title="Visualizar detalhes"
                  aria-label="Visualizar detalhes do lançamento"
                  class="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition"
                  @click="$emit('view', tx)"
                >
                  <Eye class="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Editar lançamento"
                  aria-label="Editar lançamento"
                  class="text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-amber-50 transition"
                  @click="$emit('edit', tx)"
                >
                  <Pencil class="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Excluir lançamento"
                  aria-label="Excluir lançamento"
                  class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                  @click="$emit('delete', tx)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>

          <!-- Estado Vazio -->
          <tr v-if="!loading && transactions.length === 0">
            <td colspan="6" class="py-12 text-center text-slate-400">
              <div class="max-w-xs mx-auto space-y-2">
                <ClipboardList class="w-10 h-10 mx-auto text-slate-300" />
                <p class="text-sm font-medium text-slate-600">Nenhuma transação encontrada</p>
                <p class="text-xs text-slate-400">
                  {{
                    totalCount > 0
                      ? 'Nenhum registro corresponde aos filtros atuais.'
                      : 'Insira um novo lançamento acima para começar.'
                  }}
                </p>
                <button
                  v-if="totalCount > 0 && (searchQuery || filterType !== 'all')"
                  type="button"
                  class="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                  @click="clearFilters"
                >
                  Limpar filtros
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

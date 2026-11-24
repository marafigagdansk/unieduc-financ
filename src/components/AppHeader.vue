<script setup>
import { ref } from 'vue';
import { CircleDollarSign, Download, RotateCcw, Upload } from 'lucide-vue-next';

defineProps({
  busy: {
    type: Boolean,
    default: false,
  },
  hasTransactions: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['export-json', 'import-file', 'request-reset']);

const fileInputRef = ref(null);

const openFilePicker = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  emit('import-file', file);
  // Permite selecionar o mesmo arquivo novamente caso o usuário deseje
  event.target.value = '';
};
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
      <div class="flex items-center space-x-3 min-w-0">
        <div
          class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0"
        >
          <CircleDollarSign class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <h1 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none truncate">
            Finanças Simples
          </h1>
          <p class="text-xs text-slate-500 mt-0.5 truncate">
            Controle diário de receitas e despesas
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2 shrink-0">
        <input
          ref="fileInputRef"
          type="file"
          accept=".json,application/json"
          class="hidden"
          @change="handleFileChange"
        />

        <button
          type="button"
          :disabled="busy"
          title="Importar arquivo JSON"
          aria-label="Importar arquivo JSON"
          class="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          @click="openFilePicker"
        >
          <Upload class="w-4 h-4 text-emerald-600" />
          <span class="hidden sm:inline">Importar JSON</span>
        </button>

        <button
          type="button"
          :disabled="busy || !hasTransactions"
          title="Exportar lançamentos em arquivo JSON"
          aria-label="Exportar lançamentos em arquivo JSON"
          class="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          @click="$emit('export-json')"
        >
          <Download class="w-4 h-4 text-emerald-600" />
          <span class="hidden sm:inline">Exportar JSON</span>
        </button>

        <button
          type="button"
          :disabled="busy"
          title="Restaurar dados de exemplo"
          aria-label="Restaurar dados de exemplo"
          class="text-xs text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
          @click="$emit('request-reset')"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>

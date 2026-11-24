<script setup>
import { AlertTriangle, Loader2, X } from 'lucide-vue-next';

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmar ação',
  },
  message: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar',
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (val) => ['danger', 'primary'].includes(val),
  },
  busy: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['confirm', 'cancel']);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[55] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
    @click.self="!busy && $emit('cancel')"
  >
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="
              variant === 'danger'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-emerald-50 text-emerald-600'
            "
          >
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" class="text-base font-bold text-slate-900">
              {{ title }}
            </h3>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">
              {{ message }}
            </p>
          </div>
        </div>

        <button
          type="button"
          :disabled="busy"
          aria-label="Fechar confirmação"
          class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
          @click="$emit('cancel')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          :disabled="busy"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>

        <button
          type="button"
          :disabled="busy"
          :class="
            variant === 'danger'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          "
          class="px-4 py-2 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          @click="$emit('confirm')"
        >
          <Loader2 v-if="busy" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ busy ? 'Processando...' : confirmLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

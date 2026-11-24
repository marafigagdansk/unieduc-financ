<script setup>
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-vue-next';
import { useToast } from '../composables/useToast.js';

const { toasts, dismissToast } = useToast();

const styleByType = {
  success: 'bg-slate-900 text-white border-slate-800',
  error: 'bg-rose-700 text-white border-rose-800',
  info: 'bg-slate-800 text-white border-slate-700',
};
</script>

<template>
  <div
    class="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="styleByType[toast.type] || styleByType.info"
        class="pointer-events-auto rounded-xl px-4 py-3 shadow-lg border flex items-start gap-2.5 text-xs font-medium"
      >
        <CheckCircle2
          v-if="toast.type === 'success'"
          class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
        />
        <AlertCircle
          v-else-if="toast.type === 'error'"
          class="w-4 h-4 text-rose-200 shrink-0 mt-0.5"
        />
        <Info v-else class="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />

        <span class="flex-1 leading-relaxed">{{ toast.message }}</span>

        <button
          type="button"
          aria-label="Fechar notificação"
          class="text-white/70 hover:text-white shrink-0"
          @click="dismissToast(toast.id)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

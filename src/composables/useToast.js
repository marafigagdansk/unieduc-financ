import { ref } from 'vue';

const toasts = ref([]);
let nextToastId = 1;

/**
 * Composable global simples para notificações toast (sucesso, erro, aviso e info).
 */
export function useToast() {
  const dismissToast = (id) => {
    toasts.value = toasts.value.filter((item) => item.id !== id);
  };

  const showToast = (message, type = 'success', duration = 3500) => {
    const id = nextToastId++;
    toasts.value.push({ id, message, type });

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  };

  return {
    toasts,
    showToast,
    dismissToast,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration = 5000) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
  };
}

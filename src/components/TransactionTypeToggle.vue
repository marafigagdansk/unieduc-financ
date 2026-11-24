<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (val) => ['expense', 'income'].includes(val),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex bg-slate-100 p-1 rounded-xl">
    <button
      type="button"
      :disabled="disabled"
      :class="
        modelValue === 'expense'
          ? 'bg-white text-rose-600 font-bold shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      "
      class="px-3.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 flex-1 justify-center"
      @click="$emit('update:modelValue', 'expense')"
    >
      <span
        class="w-2 h-2 rounded-full"
        :class="modelValue === 'expense' ? 'bg-rose-500' : 'bg-slate-300'"
      ></span>
      Gasto
    </button>

    <button
      type="button"
      :disabled="disabled"
      :class="
        modelValue === 'income'
          ? 'bg-white text-emerald-600 font-bold shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      "
      class="px-3.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 flex-1 justify-center"
      @click="$emit('update:modelValue', 'income')"
    >
      <span
        class="w-2 h-2 rounded-full"
        :class="modelValue === 'income' ? 'bg-emerald-500' : 'bg-slate-300'"
      ></span>
      Entrada
    </button>
  </div>
</template>

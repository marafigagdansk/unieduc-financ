<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { PieChart } from 'lucide-vue-next';
import { CHART_COLORS } from '../constants/categories.js';
import { formatCurrency } from '../utils/formatters.js';

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
});

const chartRef = ref(null);
let chartInstance = null;
let resizeObserver = null;

const topCategories = computed(() => props.categories.slice(0, 4));
const remainingCount = computed(() => Math.max(0, props.categories.length - 4));
const totalExpenses = computed(() =>
  props.categories.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
);

const buildChartOption = () => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    textStyle: {
      color: '#f8fafc',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 12,
    },
    formatter: (params) => {
      const formatted = formatCurrency(params.value);
      return `<strong>${params.name}</strong><br/>${formatted} (${params.percent}%)`;
    },
  },
  series: [
    {
      name: 'Gastos por Categoria',
      type: 'pie',
      radius: ['62%', '88%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#ffffff',
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        scale: true,
        scaleSize: 4,
      },
      data: props.categories.map((item, idx) => ({
        name: item.category,
        value: item.total,
        itemStyle: {
          color: CHART_COLORS[idx % CHART_COLORS.length],
        },
      })),
    },
  ],
});

const syncChart = () => {
  if (!chartInstance) return;

  if (props.categories.length === 0) {
    chartInstance.clear();
    return;
  }

  chartInstance.setOption(buildChartOption(), { notMerge: true });
  nextTick(() => {
    chartInstance?.resize();
  });
};

onMounted(() => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  syncChart();

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize();
    });
    resizeObserver.observe(chartRef.value);
  }
});

watch(
  () => props.categories,
  () => {
    syncChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<template>
  <div
    class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-full"
  >
    <div>
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-base font-bold text-slate-900">Gastos por Categoria</h2>
          <p class="text-xs text-slate-500">Distribuição proporcional dos gastos</p>
        </div>
        <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
          Visão Geral
        </span>
      </div>

      <div class="relative w-full h-[220px] mx-auto my-2 flex items-center justify-center">
        <div
          ref="chartRef"
          :class="categories.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'"
          class="w-full h-full transition-opacity duration-200"
        ></div>

        <div
          v-if="categories.length > 0"
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total
          </span>
          <span class="text-sm font-bold text-slate-900 tabular-nums mt-0.5">
            {{ formatCurrency(totalExpenses) }}
          </span>
        </div>

        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4"
        >
          <PieChart class="w-8 h-8 text-slate-300 mb-1.5" />
          <span>Nenhum gasto registrado para gerar o gráfico</span>
        </div>
      </div>
    </div>

    <!-- Legenda Resumida das Maiores Categorias -->
    <div v-if="categories.length > 0" class="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
      <div
        v-for="(item, idx) in topCategories"
        :key="item.category"
        class="flex items-center justify-between text-xs"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }"
          ></span>
          <span class="text-slate-600 font-medium truncate">{{ item.category }}</span>
        </div>
        <div class="text-slate-900 font-semibold tabular-nums shrink-0 ml-2">
          {{ formatCurrency(item.total) }}
          <span class="text-slate-400 font-normal">({{ item.percentage }}%)</span>
        </div>
      </div>

      <p v-if="remainingCount > 0" class="text-[11px] text-slate-400 pt-1 text-right">
        + {{ remainingCount }} outra(s) categoria(s) no gráfico
      </p>
    </div>
  </div>
</template>

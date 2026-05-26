import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAppStore } from './useAppStore';

export const useDashboardStore = defineStore('dashboard', () => {
  const appStore = useAppStore();

  const kpis = ref([]);
  const isLoading = ref(false);
  const hasData = ref(true);

  const fetchDashboardData = async (periodo = 'este_mes') => {
    isLoading.value = true;

    // Simulamos el tiempo de carga del servidor
    setTimeout(() => {
      // 1. Obtener la fecha real del sistema
      const hoy = new Date();
      const hoyStr = hoy.toISOString().split('T')[0];
      const mesActual = hoy.toISOString().slice(0, 7);

      const hace7Dias = new Date(hoy);
      hace7Dias.setDate(hoy.getDate() - 7);

      // 2. Filtrar las citas basadas en el periodo real
      let citasFiltradas = appStore.appointments;

      if (periodo === 'hoy') {
        citasFiltradas = citasFiltradas.filter((cita) => cita.date === hoyStr);
      } else if (periodo === 'esta_semana') {
        citasFiltradas = citasFiltradas.filter((cita) => new Date(cita.date) >= hace7Dias);
      } else if (periodo === 'este_mes') {
        citasFiltradas = citasFiltradas.filter((cita) => cita.date.startsWith(mesActual));
      }

      // 3. Evaluar de forma realista si hay actividad operativa
      if (citasFiltradas.length === 0) {
        hasData.value = false;
        kpis.value = [];
        isLoading.value = false;
        return;
      }

      // Si hay datos, procedemos con los cálculos
      hasData.value = true;

      // Insumos críticos (globales)
      const insumosCriticos = appStore.inventory.filter(
        (item) => item.quantity <= item.umbral
      ).length;

      // Citas
      const totalCitas = citasFiltradas.length;
      const citasCompletadas = citasFiltradas.filter((cita) => cita.status === 'completed').length;

      const porcentajeCitas =
        totalCitas > 0 ? Math.round((citasCompletadas / totalCitas) * 100) : 0;

      // Métricas financieras
      const ingresosSimulados = citasCompletadas * 150;
      const brechaActual = 810 - citasCompletadas * 50;

      kpis.value = [
        {
          id: 'brecha',
          title: 'Brecha de Ingresos',
          value: `$${brechaActual > 0 ? brechaActual : 0}`,
          icon: 'layout-dashboard',
          status: 'warning',
        },
        {
          id: 'stock',
          title: 'Desabastecimiento',
          value: insumosCriticos.toString(),
          icon: 'clipboard-list',
          status: insumosCriticos > 0 ? 'danger' : 'success',
        },
        {
          id: 'ingresos',
          title: 'Ingresos Percibidos',
          value: `$${ingresosSimulados}`,
          icon: 'clipboard-check',
          status: 'success',
        },
        {
          id: 'consumo',
          title: 'Consumo Inventario',
          value: '45',
          icon: 'syringe',
          status: 'info',
        },
        {
          id: 'citas',
          title: 'Efectividad Citas',
          value: `${porcentajeCitas}%`,
          icon: 'calendar-days',
          status: porcentajeCitas > 50 ? 'success' : 'warning',
        },
      ];

      isLoading.value = false;
    }, 1000);
  };

  return { kpis, isLoading, hasData, fetchDashboardData };
});

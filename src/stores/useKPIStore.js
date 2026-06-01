import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAppStore } from './useAppStore';
import { revenueHistory } from '../data/mockData';

export const useKPIStore = defineStore('dashboard', () => {
  const appStore = useAppStore();

  const kpis = ref([]);
  const revenueData = ref([]);
  const isLoading = ref(false);
  const hasData = ref(true);

  const fetchDashboardData = async (periodo = 'currentMonth') => {
    isLoading.value = true;

    let kpiValues;

    try {
      kpiValues = await getMockData(periodo);
    } catch {
      hasData.value = false;
      kpis.value = [];
      revenueData.value = [];
      isLoading.value = false;
      return;
    }

    const {
      brechaActual,
      insumosCriticos,
      ingresos,
      consumoInventario,
      porcentajeCitasCompletadas,
    } = kpiValues;

    hasData.value = true;

    kpis.value = [
      {
        id: 'brecha',
        title: 'Brecha de Ingresos',
        value: `${brechaActual > 0 ? brechaActual : 0}$`,
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
        value: `${ingresos}$`,
        icon: 'clipboard-check',
        status: 'success',
      },
      {
        id: 'consumo',
        title: 'Consumo Inventario',
        value: consumoInventario,
        icon: 'syringe',
        status: 'info',
      },
      {
        id: 'citas',
        title: 'Efectividad Citas',
        value: `${porcentajeCitasCompletadas}%`,
        icon: 'calendar-days',
        status: porcentajeCitasCompletadas > 50 ? 'success' : 'warning',
      },
    ];

    isLoading.value = false;
  };

  const getMockData = (periodo) => {
    return new Promise((resolve, reject) => {
      //Simular el tiempo de respuesta del servidor (1 segundo)
      setTimeout(() => {
        try {
        // Fechas de control del sistema (Respetando zona horaria local)
          const hoy = new Date();

          const year = hoy.getFullYear();
          const month = String(hoy.getMonth() + 1).padStart(2, '0');
          const day = String(hoy.getDate()).padStart(2, '0');

          const hoyStr = `${year}-${month}-${day}`;
          const mesActual = `${year}-${month}`;

          const hace7Dias = new Date(hoy);
          hace7Dias.setDate(hoy.getDate() - 7);

          // Operaciones e historial de ingresos por periodo
          let citasFiltradas = appStore.appointments;

          if (periodo === 'today') {
            citasFiltradas = citasFiltradas.filter((cita) => cita.date === hoyStr);
            revenueData.value = revenueHistory.today;
          } else if (periodo === 'currentWeek') {
            citasFiltradas = citasFiltradas.filter((cita) => new Date(cita.date) >= hace7Dias);
            revenueData.value = revenueHistory.currentWeek;
          } else if (periodo === 'currentMonth') {
            citasFiltradas = citasFiltradas.filter((cita) => cita.date.startsWith(mesActual));
            revenueData.value = revenueHistory.currentMonth;
          }

          //Desabastecimiento de Insumos
          const insumosCriticos = appStore.inventory.filter(
            (item) => item.quantity <= item.minStock
          ).length;

          //Eficiencia de Citas
          const totalCitas = citasFiltradas.length;
          const citasCompletadas = citasFiltradas.filter((cita) => cita.status === 'completed').length;

          const porcentajeCitasCompletadas =
            totalCitas > 0 ? Math.round((citasCompletadas / totalCitas) * 100) : 0;

          //Métricas financieras
          const ingresos = citasCompletadas * 150;
          const brechaActual = 810 - citasCompletadas * 50;

          resolve({
            brechaActual,
            insumosCriticos,
            ingresos,
            consumoInventario: '45',
            porcentajeCitasCompletadas,
          });
        } catch (e) {
          reject(e);
        }
      }, 1000);
    })
  }

  //Retornamos revenueData junto con los demás estados para que la vista pueda leerlo
  return { kpis, revenueData, isLoading, hasData, fetchDashboardData };
});

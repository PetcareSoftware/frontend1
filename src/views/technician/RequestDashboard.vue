<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import PageHeader from '@/components/shared/PageHeader.vue'
import DashboardCard from '@/components/shared/DashboardCard.vue'

const appStore = useAppStore()

// Reactividad con las solicitudes guardadas en el store global
const solicitudes = computed(() => appStore.requisitions)

// Estado local para el filtrado por estado
const filtroEstado = ref('Todos')

// Lógica de filtrado reactivo
const solicitudesFiltradas = computed(() => {
  if (filtroEstado.value === 'Todos') {
    return solicitudes.value
  }
  return solicitudes.value.filter(s => s.estado === filtroEstado.value)
})

// Helper para dar color visual al badge del estado
const getBadgeClass = (estado) => {
  if (estado === 'Pendiente') return 'badge--warning'
  if (estado === 'Aprobada') return 'badge--success'
  if (estado === 'Rechazada') return 'badge--danger'
  return ''
}
</script>

<template>
  <div class="stack">
    <PageHeader 
      title="Panel de Seguimiento de Solicitudes" 
      subtitle="Monitorización de peticiones y decisiones de la gerencia (Req. 6.7.2)."
    />

    <DashboardCard title="Historial de Solicitudes Enviadas" icon="clipboard-list">
      
      <div class="filter-container" style="margin-top: 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
        <label for="filtro-estado" style="font-weight: 500;">Filtrar por Estado:</label>
        <select id="filtro-estado" v-model="filtroEstado" class="select" style="max-width: 200px; padding: 8px;">
          <option value="Todos">Mostrar Todas</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      </div>

      <div v-if="solicitudesFiltradas.length > 0" style="overflow-x: auto;">
        <table class="preview-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 2px solid #ddd; background-color: rgba(0,0,0,0.02);">
              <th style="padding: 12px 8px;">ID Solicitud</th>
              <th style="padding: 12px 8px;">Fecha de Creación</th>
              <th style="padding: 12px 8px;">Cantidad de Productos</th>
              <th style="padding: 12px 8px;">Costo Total Estimado</th>
              <th style="padding: 12px 8px;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="solicitud in solicitudesFiltradas" :key="solicitud.id" style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 8px; font-weight: bold; color: #555;">
                #{{ solicitud.id }}
              </td>
              <td style="padding: 12px 8px;">
                {{ solicitud.fecha }}
              </td>
              <td style="padding: 12px 8px; text-align: center;">
                {{ solicitud.cantidadProductos }} uds.
              </td>
              <td style="padding: 12px 8px; font-weight: bold; color: #2c3e50;">
                ${{ solicitud.total.toFixed(2) }} USD
              </td>
              <td style="padding: 12px 8px;">
                <span :class="['badge', getBadgeClass(solicitud.estado)]">
                  {{ solicitud.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else style="text-align: center; padding: 40px 20px; color: #888;">
        <p>No se encontraron solicitudes enviadas con el estado seleccionado.</p>
      </div>

    </DashboardCard>
  </div>
</template>

<style scoped>
/* Estilos rápidos para badges de estado */
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
}
.badge--warning { background-color: #f39c12; color: white; }
.badge--success { background-color: #2ecc71; color: white; }
.badge--danger { background-color: #e74c3c; color: white; }
</style>
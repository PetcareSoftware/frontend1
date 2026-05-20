<script setup>
  import { computed, ref } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import StatusBadge from '@/components/shared/StatusBadge.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import { useToastStore } from '@/stores/useToastStore';
  import { formatDate, getOwnerAppointments, getPet, getVet } from '@/lib/petcare';

  const appStore = useAppStore();
  const toastStore = useToastStore();
  const activeFilter = ref('all');

  // Modal State
  const isModalOpen = ref(false);
  const selectedAppointment = ref(null);
  const cancelReasonInput = ref('');

  const filteredAppointments = computed(() => {
    const appointments = getOwnerAppointments(appStore.appointments, appStore.currentUserId);

    if (activeFilter.value === 'all') return appointments;
    if (activeFilter.value === 'upcoming')
      return appointments.filter(
        (item) =>
          item.status === 'scheduled' || item.status === 'confirmed' || item.status === 'waiting'
      );
    return appointments.filter((item) => item.status === activeFilter.value);
  });

  function openCancelModal(appointment) {
    selectedAppointment.value = appointment;
    cancelReasonInput.value = '';
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
    selectedAppointment.value = null;
    cancelReasonInput.value = '';
  }

  function confirmCancellation() {
    if (!selectedAppointment.value || !cancelReasonInput.value.trim()) return;

    appStore.cancelAppointment(selectedAppointment.value.id, cancelReasonInput.value.trim());
    toastStore.push({
      title: 'Cita cancelada',
      description: `${selectedAppointment.value.reason} fue cancelada.`,
      type: 'info',
    });
    closeModal();
  }
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Mis Citas"
      subtitle="Listado de citas del propietario con filtros por estado y acciones rápidas."
    />

    <div class="toolbar">
      <div class="toolbar__group">
        <button
          class="btn btn--ghost"
          :class="{ 'btn--primary': activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          Todas
        </button>
        <button
          class="btn btn--ghost"
          :class="{ 'btn--primary': activeFilter === 'upcoming' }"
          @click="activeFilter = 'upcoming'"
        >
          Próximas
        </button>
        <button
          class="btn btn--ghost"
          :class="{ 'btn--primary': activeFilter === 'completed' }"
          @click="activeFilter = 'completed'"
        >
          Completadas
        </button>
        <button
          class="btn btn--ghost"
          :class="{ 'btn--primary': activeFilter === 'cancelled' }"
          @click="activeFilter = 'cancelled'"
        >
          Canceladas
        </button>
      </div>
    </div>

    <section class="card table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Mascota</th>
            <th>Motivo</th>
            <th>Veterinario</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in filteredAppointments" :key="appointment.id" class="table__row">
            <td>{{ formatDate(appointment.date) }} · {{ appointment.time }}</td>
            <td>{{ getPet(appStore.pets, appointment.petId)?.name }}</td>
            <td>{{ appointment.reason }}</td>
            <td>{{ getVet(appStore.vets, appointment.vetId)?.name }}</td>
            <td><StatusBadge :status="appointment.status" /></td>
            <td>
              <button
                v-if="appointment.status !== 'completed' && appointment.status !== 'cancelled'"
                class="btn btn--soft btn--sm"
                type="button"
                @click="openCancelModal(appointment)"
              >
                Cancelar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Modal de Cancelación Personalizado -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="card modal-content stack">
        <h3 class="modal-title">Cancelar Cita</h3>
        <p class="modal-desc">
          Por favor, indica el motivo de la cancelación para la cita de 
          <strong>{{ getPet(appStore.pets, selectedAppointment?.petId)?.name }}</strong>.
        </p>
        
        <label class="field" style="margin-top: 12px;">
          <span>Motivo de cancelación</span>
          <input
            v-model="cancelReasonInput"
            class="input"
            type="text"
            placeholder="Ej. Cambio de planes, Mascota recuperada"
            @keyup.enter="confirmCancellation"
            ref="reasonInput"
            style="width: 100%"
          />
        </label>
        
        <div class="toolbar" style="margin-top: 20px; justify-content: flex-end; gap: 8px;">
          <button class="btn btn--ghost" type="button" @click="closeModal">Volver</button>
          <button
            class="btn btn--primary"
            type="button"
            :disabled="!cancelReasonInput.trim()"
            @click="confirmCancellation"
          >
            Confirmar Cancelación
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(28, 26, 20, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease-out;
}

.modal-content {
  width: 95%;
  max-width: 480px;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow);
  padding: 32px;
  border-radius: var(--radius-lg);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-title {
  margin: 0 0 8px 0;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-strong);
}

.modal-desc {
  color: rgba(61, 61, 61, 0.78);
  font-size: 0.92rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>

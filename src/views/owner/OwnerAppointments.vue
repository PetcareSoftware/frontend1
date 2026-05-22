<script setup>
  import { computed, ref, reactive } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import StatusBadge from '@/components/shared/StatusBadge.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import { useToastStore } from '@/stores/useToastStore';
  import { formatDate, getOwnerAppointments, getPet, getVet, getOwnerPets, timeSlots } from '@/lib/petcare';

  const appStore = useAppStore();
  const toastStore = useToastStore();
  const activeFilter = ref('all');
  const showNewAppointmentModal = ref(false);

  const pets = computed(() => getOwnerPets(appStore.pets, appStore.currentUserId));

  const form = reactive({
    petId: '',
    date: '',
    time: '09:00',
    reason: '',
  });

  function scheduleAppointment() {
    if (!form.petId || !form.reason || !form.date) {
      toastStore.push({ title: 'Completa la información requerida', type: 'error' });
      return;
    }
    appStore.addAppointment({
      id: `a${Date.now()}`,
      petId: form.petId,
      ownerId: appStore.currentUserId,
      vetId: 'v1',
      date: form.date,
      time: form.time,
      reason: form.reason,
      status: 'scheduled',
      notes: '',
    });
    toastStore.push({
      title: 'Cita agendada',
      description: 'La solicitud quedó registrada en el sistema.',
      type: 'success',
    });
    showNewAppointmentModal.value = false;
    form.reason = '';
    form.date = '';
  }

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

  function cancelAppointment(appointment) {
    appStore.cancelAppointment(appointment.id);
    toastStore.push({
      title: 'Cita cancelada',
      description: `${appointment.reason} fue cancelada.`,
      type: 'info',
    });
  }
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Mis Citas"
      subtitle="Listado de citas del propietario con filtros por estado y acciones rápidas."
    />

    <div class="toolbar" style="display: flex; justify-content: space-between;">
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
      <button class="btn btn--primary" @click="showNewAppointmentModal = true">+ Nueva Cita</button>
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
                class="btn btn--soft"
                type="button"
                @click="cancelAppointment(appointment)"
              >
                Cancelar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <dialog class="modal" :open="showNewAppointmentModal">
      <div class="modal__backdrop" @click="showNewAppointmentModal = false"></div>
      <div class="modal__content card">
        <h2 class="section__title">Agendar Cita</h2>
        <div class="input-row" style="margin-top: 1rem;">
          <label class="field">
            <span>Selecciona la mascota</span>
            <select v-model="form.petId" class="select">
              <option v-for="pet in pets" :key="pet.id" :value="pet.id">
                {{ pet.name }}
              </option>
            </select>
          </label>
          <div class="input-grid">
            <label class="field">
              <span>Fecha</span>
              <input v-model="form.date" class="input" type="date" />
            </label>
            <label class="field">
              <span>Hora</span>
              <select v-model="form.time" class="select">
                <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
              </select>
            </label>
          </div>
          <label class="field">
            <span>Motivo</span>
            <input v-model="form.reason" class="input" type="text" placeholder="Control anual" />
          </label>
          <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            <button class="btn btn--primary" type="button" @click="scheduleAppointment">Confirmar</button>
            <button class="btn btn--soft" type="button" @click="showNewAppointmentModal = false">Cancelar</button>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
}
.modal[open] {
  display: flex;
}
.modal:not([open]) {
  display: none;
}
.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
}
.modal__content {
  position: relative;
  z-index: 101;
  width: 100%;
  max-width: 500px;
  background: var(--surface);
  padding: 2rem;
  border-radius: 12px;
}
</style>

<script setup>
  import { computed, ref } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import StatusBadge from '@/components/shared/StatusBadge.vue';
  import DashboardCard from '@/components/shared/DashboardCard.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import {
    getAppointmentsByVet,
    getPet,
    getVet,
    getLatestConsultation,
    getLatestVaccine,
  } from '@/lib/petcare';

  const appStore = useAppStore();
  const selectedAppointmentId = ref('');

  const currentVetId = computed(() => appStore.currentUserId || 'v1');
  const patients = computed(() =>
    getAppointmentsByVet(appStore.appointments, currentVetId.value).filter(
      (appointment) => appointment.date === '2026-05-08'
    )
  );
  const selectedAppointment = computed(
    () =>
      patients.value.find((appointment) => appointment.id === selectedAppointmentId.value) ||
      patients.value[0] ||
      null
  );
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Pacientes del Día"
      subtitle="Pacientes asignados al veterinario para la jornada actual."
    />

    <section class="split">
      <DashboardCard title="Lista de pacientes" icon="dog">
        <div class="list">
          <button
            v-for="appointment in patients"
            :key="appointment.id"
            class="list__item"
            type="button"
            @click="selectedAppointmentId = appointment.id"
          >
            <div class="toolbar__group">
              <PetAvatar :pet="getPet(appStore.pets, appointment.petId)" size="sm" />
              <div class="list__item-main">
                <p class="list__title">
                  {{ appointment.time }} · {{ getPet(appStore.pets, appointment.petId)?.name }}
                </p>
                <p class="list__subtitle">{{ appointment.reason }}</p>
              </div>
            </div>
            <StatusBadge :status="appointment.status" />
          </button>
        </div>
      </DashboardCard>

      <DashboardCard v-if="selectedAppointment" title="Detalle" icon="clipboard-list">
        <div class="stack">
          <div class="hero-intro">
            <p class="eyebrow">Veterinario</p>
            <h2 class="hero-intro__title">
              {{ getVet(appStore.vets, currentVetId)?.name || 'Veterinario' }}
            </h2>
            <p class="hero-intro__text">{{ selectedAppointment.reason }}</p>
          </div>
          <div class="list__item">
            <div class="toolbar__group">
              <PetAvatar :pet="getPet(appStore.pets, selectedAppointment.petId)" size="lg" />
              <div class="list__item-main">
                <p class="list__title">
                  {{ getPet(appStore.pets, selectedAppointment.petId)?.name }}
                </p>
                <p class="list__subtitle">
                  Última consulta:
                  {{
                    getLatestConsultation(appStore.consultations, selectedAppointment.petId)
                      ?.date || 'Sin consultas'
                  }}
                </p>
                <p class="list__subtitle">
                  Última vacuna:
                  {{
                    getLatestVaccine(appStore.vaccines, selectedAppointment.petId)?.date ||
                    'Sin vacunas'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </section>
  </div>
</template>

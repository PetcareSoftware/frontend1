<script setup>
  import { computed } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import StatusBadge from '@/components/shared/StatusBadge.vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import DashboardCard from '@/components/shared/DashboardCard.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import {
    formatDate,
    getAppointmentsByDate,
    getPet,
    getVet,
    daysFromNow,
    sortAppointments,
  } from '@/lib/petcare';

  const appStore = useAppStore();
  const dates = computed(() =>
    Array.from({ length: 5 }, (_, index) => daysFromNow(index)).map((date) => ({
      date,
      items: getAppointmentsByDate(appStore.appointments, date),
    }))
  );
</script>

<template>
  <div class="stack">
    <PageHeader title="Calendario" subtitle="Vista de agenda y distribución de citas por fecha." />

    <section class="grid grid--2">
      <DashboardCard
        v-for="day in dates"
        :key="day.date"
        :title="formatDate(day.date)"
        icon="calendar-days"
      >
        <div class="list">
          <article
            v-for="appointment in day.items.slice().sort(sortAppointments)"
            :key="appointment.id"
            class="list__item"
          >
            <div class="toolbar__group">
              <PetAvatar :pet="getPet(appStore.pets, appointment.petId)" size="sm" />
              <div class="list__item-main">
                <p class="list__title">
                  {{ appointment.time }} · {{ getPet(appStore.pets, appointment.petId)?.name }}
                </p>
                <p class="list__subtitle">
                  {{ appointment.reason }} · {{ getVet(appStore.vets, appointment.vetId)?.name }}
                </p>
              </div>
            </div>
            <StatusBadge :status="appointment.status" />
          </article>
          <p v-if="!day.items.length" class="muted">Sin citas agendadas.</p>
        </div>
      </DashboardCard>
    </section>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import StatCard from '@/components/shared/StatCard.vue';
  import DashboardCard from '@/components/shared/DashboardCard.vue';
  import StatusBadge from '@/components/shared/StatusBadge.vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import {
    formatDate,
    getAppointmentStats,
    getPet,
    getVet,
    getTodayAppointments,
  } from '@/lib/petcare';

  const appStore = useAppStore();
  const todayAppointments = computed(() => getTodayAppointments(appStore.appointments));
  const stats = computed(() => getAppointmentStats(todayAppointments.value));
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Dashboard de Recepción"
      subtitle="Operaciones del día, agenda y acciones rápidas."
    />

    <section class="grid grid--4">
      <StatCard label="Programadas" :value="stats.scheduled" icon="calendar-days" />
      <StatCard
        label="Confirmadas"
        :value="stats.confirmed"
        icon="check-circle-2"
        tone-class="chip--sage"
      />
      <StatCard
        label="En consulta"
        :value="stats.in_progress"
        icon="stethoscope"
        tone-class="chip--warning"
      />
      <StatCard
        label="En espera"
        :value="stats.waiting"
        icon="hourglass"
        tone-class="chip--cream"
      />
    </section>

    <section class="split">
      <DashboardCard title="Agenda de hoy" icon="calendar-days">
        <div class="list">
          <article
            v-for="appointment in todayAppointments"
            :key="appointment.id"
            class="list__item"
          >
            <div class="toolbar__group">
              <PetAvatar :pet="getPet(appStore.pets, appointment.petId)" size="sm" />
              <div class="list__item-main">
                <p class="list__title">
                  {{ appointment.time }} · {{ getPet(appStore.pets, appointment.petId)?.name }}
                  <span v-if="appointment.type === 'Emergencia'" class="chip chip--danger" style="margin-left: 8px; padding: 0.2rem 0.5rem; font-size: 0.7rem;">
                    Emergencia ({{ appointment.priority }})
                  </span>
                </p>
                <p class="list__subtitle">
                  {{ appointment.reason }} · {{ getVet(appStore.vets, appointment.vetId)?.name }}
                </p>
              </div>
            </div>
            <StatusBadge :status="appointment.status" />
          </article>
        </div>
      </DashboardCard>

      <DashboardCard title="Resumen operativo" icon="clipboard-list">
        <div class="stack">
          <div class="hero-intro">
            <p class="eyebrow">Fecha actual</p>
            <h2 class="hero-intro__title">{{ formatDate(new Date().toISOString().split('T')[0]) }}</h2>
            <p class="hero-intro__text">
              La recepción puede usar esta vista para confirmar citas, atender llegadas y
              administrar la lista de espera.
            </p>
          </div>
          <div class="summary-grid">
            <article class="card">
              <p class="eyebrow">Agenda</p>
              <strong>{{ todayAppointments.length }}</strong>
            </article>
            <article class="card">
              <p class="eyebrow">Pacientes</p>
              <strong>{{ todayAppointments.length }}</strong>
            </article>
            <article class="card">
              <p class="eyebrow">Consultorios</p>
              <strong>3</strong>
            </article>
          </div>
        </div>
      </DashboardCard>
    </section>
  </div>
</template>

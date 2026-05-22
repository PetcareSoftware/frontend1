<script setup>
  import { computed } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import DashboardCard from '@/components/shared/DashboardCard.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import {
    formatDate,
    getLatestConsultation,
    getLatestVaccine,
    getOwnerPets,
  } from '@/lib/petcare';

  const appStore = useAppStore();
  const pets = computed(() => getOwnerPets(appStore.pets, appStore.currentUserId));
</script>

<template>
  <div class="stack">
    <PageHeader title="Mis Mascotas" subtitle="Gestión de mascotas vinculadas al propietario." />

    <div class="toolbar" style="margin-bottom: 1rem;">
      <router-link to="/portal/pets/add" class="btn btn--primary">
        + Agregar mascota
      </router-link>
    </div>

    <section>
      <DashboardCard title="Mascotas registradas" icon="paw-print">
        <div class="list">
          <article v-for="pet in pets" :key="pet.id" class="list__item">
            <div class="toolbar__group">
              <PetAvatar :pet="pet" size="sm" />
              <div class="list__item-main">
                <p class="list__title">{{ pet.name }}</p>
                <p class="list__subtitle">{{ pet.breed }} · {{ pet.color }}</p>
                <p class="list__subtitle">
                  Última consulta:
                  {{
                    getLatestConsultation(appStore.consultations, pet.id)?.date
                      ? formatDate(getLatestConsultation(appStore.consultations, pet.id).date)
                      : 'Sin consultas'
                  }}
                </p>
              </div>
            </div>
            <div class="stack pet-status">
              <span class="chip chip--sage">{{ pet.species }}</span>
              <span class="muted"
                >Vacunas:
                {{ getLatestVaccine(appStore.vaccines, pet.id) ? 'Activas' : 'Sin datos' }}</span
              >
            </div>
          </article>
          <p v-if="!pets.length" class="muted">Todavía no hay mascotas asociadas.</p>
        </div>
      </DashboardCard>
    </section>
  </div>
</template>

<style scoped>
.pet-status {
  justify-items: end;
  gap: 8px;
}
</style>

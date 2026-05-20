<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import DashboardCard from '@/components/shared/DashboardCard.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import { useToastStore } from '@/stores/useToastStore';
  import {
    formatDate,
    getLatestConsultation,
    getLatestDeworming,
    getLatestVaccine,
    getOwnerPets,
    getPetConsultations,
    getPetVaccines,
    getPetDewormings,
  } from '@/lib/petcare';
  import Modal from '@/components/shared/Modal.vue';

  const appStore = useAppStore();
  const toastStore = useToastStore();
  const pets = computed(() => getOwnerPets(appStore.pets, appStore.currentUserId));

  const form = reactive({
    name: '',
    species: 'dog',
    breed: 'Golden Retriever',
    sex: 'M',
    birthDate: '',
    weight: '',
    color: '',
    notes: '',
  });

  const breedsBySpecies = {
    dog: ['Golden Retriever', 'Bulldog Francés', 'Pastor Alemán', 'Labrador', 'Mestizo', 'Otro'],
    cat: ['Persa', 'Siamés', 'Mestizo', 'Otro'],
    bird: ['Canario', 'Loro', 'Otro'],
    rabbit: ['Enano', 'Belier', 'Otro'],
    other: ['Otro']
  };

  const availableBreeds = computed(() => breedsBySpecies[form.species] || ['Otro']);

  watch(() => form.species, () => {
    form.breed = availableBreeds.value[0];
  });

  const selectedPetConsultations = computed(() => 
    selectedPet.value ? getPetConsultations(appStore.consultations, selectedPet.value.id) : []
  );
  const selectedPetVaccines = computed(() => 
    selectedPet.value ? getPetVaccines(appStore.vaccines, selectedPet.value.id) : []
  );
  const selectedPetDewormings = computed(() => 
    selectedPet.value ? getPetDewormings(appStore.dewormings, selectedPet.value.id) : []
  );

  const isFormModalOpen = ref(false);
  const isDetailModalOpen = ref(false);
  const editingPetId = ref(null);
  const selectedPet = ref(null);

  function savePet() {
    if (!form.name || !form.breed || !form.birthDate) {
      toastStore.push({ title: 'Completa los campos requeridos', type: 'error' });
      return;
    }

    if (editingPetId.value) {
      appStore.updatePet({
        id: editingPetId.value,
        ownerId: appStore.currentUserId,
        name: form.name,
        species: form.species,
        breed: form.breed,
        sex: form.sex,
        birthDate: form.birthDate,
        weight: Number(form.weight) || 0,
        color: form.color,
        notes: form.notes,
      });

      toastStore.push({
        title: 'Mascota actualizada',
        description: `Los datos de ${form.name} fueron actualizados.`,
        type: 'success',
      });
    } else {
      appStore.addPet({
        id: `p${Date.now()}`,
        ownerId: appStore.currentUserId,
        name: form.name,
        species: form.species,
        breed: form.breed,
        sex: form.sex,
        birthDate: form.birthDate,
        weight: Number(form.weight) || 0,
        color: form.color,
        notes: form.notes,
      });

      toastStore.push({
        title: 'Mascota agregada',
        description: `${form.name} se sumó al perfil.`,
        type: 'success',
      });
    }
    
    resetForm();
    isFormModalOpen.value = false;
  }

  function editPet(pet) {
    editingPetId.value = pet.id;
    form.name = pet.name || '';
    form.species = pet.species || 'dog';
    form.breed = pet.breed || availableBreeds.value[0];
    form.sex = pet.sex || 'M';
    form.birthDate = pet.birthDate || '';
    form.weight = pet.weight || '';
    form.color = pet.color || '';
    form.notes = pet.notes || '';
    isFormModalOpen.value = true;
  }

  function viewPet(pet) {
    selectedPet.value = pet;
    isDetailModalOpen.value = true;
  }

  function resetForm() {
    editingPetId.value = null;
    form.name = '';
    form.species = 'dog';
    form.breed = breedsBySpecies.dog[0];
    form.sex = 'M';
    form.birthDate = '';
    form.weight = '';
    form.color = '';
    form.notes = '';
  }
</script>

<template>
  <div class="stack">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <PageHeader title="Mis Mascotas" subtitle="Gestión de mascotas vinculadas al propietario." />
      <button class="btn btn--primary" @click="resetForm(); isFormModalOpen = true">
        + Agregar Mascota
      </button>
    </div>

    <section class="split">
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
            <div class="stack" style="justify-items: end; gap: 8px">
              <span class="chip chip--sage">{{ pet.species }}</span>
              <span class="muted"
                >Vacunas:
                {{ getLatestVaccine(appStore.vaccines, pet.id) ? 'Activas' : 'Sin datos' }}</span
              >
              <div style="display: flex; gap: 8px;">
                <button class="btn btn--soft" style="padding: 4px 12px; font-size: 0.8rem;" type="button" @click="viewPet(pet)">Ver detalle</button>
                <button class="btn" style="padding: 4px 12px; font-size: 0.8rem; background: var(--color-surface); border: 1px solid var(--color-border);" type="button" @click="editPet(pet)">Editar</button>
              </div>
            </div>
          </article>
          <p v-if="!pets.length" class="muted">Todavía no hay mascotas asociadas.</p>
        </div>
      </DashboardCard>
    </section>

    <!-- Modal for Pet Details -->
    <Modal 
      :isOpen="isDetailModalOpen" 
      @close="isDetailModalOpen = false" 
      :title="selectedPet ? `Detalle de ${selectedPet.name}` : 'Detalle de Mascota'"
      maxWidth="600px"
    >
      <div v-if="selectedPet" class="stack" style="gap: 20px;">
        <div style="display: flex; gap: 20px; align-items: center; padding-bottom: 20px; border-bottom: 1px solid rgba(194, 167, 105, 0.15);">
          <PetAvatar :pet="selectedPet" size="lg" style="width: 80px; height: 80px;" />
          <div>
            <h3 style="margin: 0; font-size: 1.6rem; color: var(--text-strong);">{{ selectedPet.name }}</h3>
            <p style="margin: 4px 0 0; color: rgba(61, 61, 61, 0.8); font-size: 1rem;">
              {{ selectedPet.breed }} · {{ selectedPet.sex === 'M' ? 'Macho' : 'Hembra' }}
            </p>
          </div>
        </div>

        <div class="input-grid">
          <div>
            <p class="eyebrow">Especie</p>
            <p style="margin: 4px 0 0; font-weight: 600;">{{ selectedPet.species === 'dog' ? 'Perro' : selectedPet.species === 'cat' ? 'Gato' : selectedPet.species === 'bird' ? 'Ave' : selectedPet.species === 'rabbit' ? 'Conejo' : 'Otro' }}</p>
          </div>
          <div>
            <p class="eyebrow">Fecha de nacimiento</p>
            <p style="margin: 4px 0 0; font-weight: 600;">{{ formatDate(selectedPet.birthDate) }}</p>
          </div>
          <div>
            <p class="eyebrow">Peso</p>
            <p style="margin: 4px 0 0; font-weight: 600;">{{ selectedPet.weight ? `${selectedPet.weight} kg` : 'No registrado' }}</p>
          </div>
          <div>
            <p class="eyebrow">Color</p>
            <p style="margin: 4px 0 0; font-weight: 600;">{{ selectedPet.color || 'No registrado' }}</p>
          </div>
        </div>

        <div v-if="selectedPet.notes">
          <p class="eyebrow">Notas</p>
          <p style="margin: 8px 0 0; padding: 12px; background: rgba(194, 167, 105, 0.08); border-radius: 12px; line-height: 1.5;">
            {{ selectedPet.notes }}
          </p>
        </div>

        <div>
          <h4 style="margin: 24px 0 16px; font-size: 1.2rem; color: var(--text-strong); border-bottom: 1px solid rgba(194, 167, 105, 0.15); padding-bottom: 8px;">Historial Médico</h4>
          
          <div v-if="selectedPetConsultations.length > 0" style="margin-bottom: 16px;">
            <p class="eyebrow" style="margin-bottom: 8px;">Consultas</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div v-for="consult in selectedPetConsultations" :key="consult.id" style="padding: 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <strong style="color: var(--text-strong);">{{ formatDate(consult.date) }}</strong>
                  <span class="chip chip--sage" style="font-size: 0.75rem;">{{ consult.diagnosis || 'Sin diagnóstico' }}</span>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">{{ consult.symptoms || consult.notes || 'Consulta de rutina' }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="selectedPetVaccines.length > 0" style="margin-bottom: 16px;">
            <p class="eyebrow" style="margin-bottom: 8px;">Vacunas</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div v-for="vaccine in selectedPetVaccines" :key="vaccine.id" style="padding: 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <strong style="color: var(--text-strong);">{{ vaccine.name }}</strong>
                  <span style="font-size: 0.85rem; color: var(--text-muted);">{{ formatDate(vaccine.date) }}</span>
                </div>
                <p v-if="vaccine.nextDate" style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Próxima dosis: {{ formatDate(vaccine.nextDate) }}</p>
              </div>
            </div>
          </div>

          <div v-if="selectedPetDewormings.length > 0" style="margin-bottom: 16px;">
            <p class="eyebrow" style="margin-bottom: 8px;">Desparasitaciones</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div v-for="deworm in selectedPetDewormings" :key="deworm.id" style="padding: 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <strong style="color: var(--text-strong);">{{ deworm.product }}</strong>
                  <span style="font-size: 0.85rem; color: var(--text-muted);">{{ formatDate(deworm.date) }}</span>
                </div>
                <p v-if="deworm.nextDate" style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Próxima dosis: {{ formatDate(deworm.nextDate) }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="selectedPetConsultations.length === 0 && selectedPetVaccines.length === 0 && selectedPetDewormings.length === 0">
            <p class="muted">No hay registros médicos disponibles para esta mascota.</p>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
          <button class="btn btn--primary" type="button" @click="isDetailModalOpen = false; editPet(selectedPet)">
            Editar Mascota
          </button>
        </div>
      </div>
    </Modal>

    <!-- Modal for Add/Edit Form -->
    <Modal 
      :isOpen="isFormModalOpen" 
      @close="isFormModalOpen = false" 
      :title="editingPetId ? 'Editar mascota' : 'Agregar mascota'"
      maxWidth="600px"
    >
      <div class="input-row">
        <label class="field"
          ><span>Nombre *</span><input v-model="form.name" class="input" type="text"
        /></label>
        <div class="input-grid">
          <label class="field"
            ><span>Especie</span
            ><select v-model="form.species" class="select">
              <option value="dog">Perro</option>
              <option value="cat">Gato</option>
              <option value="bird">Ave</option>
              <option value="rabbit">Conejo</option>
              <option value="other">Otro</option>
            </select></label
          >
          <label class="field"
            ><span>Raza *</span
            ><select v-model="form.breed" class="select">
              <option v-for="breed in availableBreeds" :key="breed" :value="breed">{{ breed }}</option>
            </select></label
          >
        </div>
        <div class="input-grid">
          <label class="field"
            ><span>Sexo</span
            ><select v-model="form.sex" class="select">
              <option value="M">Macho (M)</option>
              <option value="F">Hembra (F)</option>
            </select></label
          >
          <label class="field"
            ><span>Fecha de nacimiento *</span
            ><input v-model="form.birthDate" class="input" type="date"
          /></label>
        </div>
        <div class="input-grid">
          <label class="field"
            ><span>Peso (kg)</span
            ><input v-model="form.weight" class="input" type="number" min="0" step="0.1"
          /></label>
          <label class="field"
            ><span>Color</span><input v-model="form.color" class="input" type="text"
          /></label>
        </div>
        <label class="field"
          ><span>Notas</span><textarea v-model="form.notes" class="textarea" rows="3" />
        </label>
        <div style="display: flex; gap: 12px; margin-top: 8px; justify-content: flex-end;">
          <button class="btn" style="background: transparent; color: var(--text-strong);" type="button" @click="isFormModalOpen = false">
            Cancelar
          </button>
          <button class="btn btn--primary" type="button" @click="savePet">
            {{ editingPetId ? 'Guardar cambios' : 'Agregar mascota' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

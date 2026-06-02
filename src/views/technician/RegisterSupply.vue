<script setup>
import { ref } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore';
import { useToastStore } from '@/stores/useToastStore';

const EMPTY_FORM = {
  nombre: '',
  tipo: '',
  cantidad: '',
  precio: '',
  minStock: '',
  observaciones: '',
};

const appStore = useAppStore();
const toastStore = useToastStore();
const open = ref(true);
const form = ref({ ...EMPTY_FORM });

const resetForm = () => {
  Object.assign(form.value, EMPTY_FORM);
};

function handleSubmit() {
  appStore.addSupply({
    id: Date.now(),
    name: form.value.nombre,
    type: form.value.tipo,
    quantity: Number(form.value.cantidad),
    unitCost: Number(form.value.precio),
    minStock: Number(form.value.minStock),
    batches: [],
  });

  toastStore.push({
    title: 'Insumo registrado',
    description: `${form.value.nombre} fue agregado al catálogo maestro.`,
    type: 'success',
  });

  resetForm();
}
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Registrar insumo"
      subtitle="Alta de productos en el catálogo maestro de la clínica."
    />
    <DashboardCard title="Nuevo insumo" icon="notebook-pen">
      <form v-show="open" class="stack form-section" @submit.prevent="handleSubmit">
        <label class="field field--required">
          <span class="field__label">Nombre</span>
          <input
            class="input"
            v-model="form.nombre"
            required
            placeholder="Nombre del medicamento o insumo"
          />
        </label>
        <label class="field field--required">
          <span class="field__label">Tipo</span>
          <select class="select" v-model="form.tipo" required>
            <option value="" disabled>Seleccionar...</option>
            <option>Medicamento</option>
            <option>Insumo</option>
          </select>
        </label>
        <label class="field field--required">
          <span class="field__label">Cantidad</span>
          <input
            class="input"
            v-model="form.cantidad"
            type="number"
            min="1"
            required
            placeholder="Cantidad disponible"
          />
        </label>
        <label class="field field--required">
          <span class="field__label">Costo unitario (USD)</span>
          <input
            class="input"
            v-model="form.precio"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Costo por unidad"
          />
        </label>
        <label class="field field--required">
          <span class="field__label">Nivel mínimo de existencias</span>
          <input
            class="input"
            v-model="form.minStock"
            type="number"
            min="1"
            required
            placeholder="Ejemplo: 10"
          />
        </label>
        <label class="field">
          <span class="field__label">Observaciones</span>
          <textarea
            class="textarea"
            v-model="form.observaciones"
            placeholder="Notas internas del catálogo"
          />
        </label>
        <button class="btn btn--primary" type="submit">Registrar</button>
      </form>
    </DashboardCard>
  </div>
</template>

<style scoped>
.form-section {
  margin-top: 28px;
}
</style>

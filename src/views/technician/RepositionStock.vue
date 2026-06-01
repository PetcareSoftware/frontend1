<script setup>
import { ref, computed } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore';
import { useToastStore } from '@/stores/useToastStore';

const EMPTY_FORM = {
  supplyId: '',
  quantity: 1,
  batch: '',
  expirationDate: '',
  observations: '',
};

const appStore = useAppStore();
const toastStore = useToastStore();

const today = new Date().toISOString().split('T')[0];
const open = ref(true);
const form = ref({ ...EMPTY_FORM });

const listaInsumos = computed(() => appStore.inventory);
const batchLoading = computed(() => appStore.status.batch.loading);

const resetForm = () => {
  Object.assign(form.value, EMPTY_FORM);
};

const guardarEntrada = async () => {
  if (batchLoading.value) return;

  if (!form.value.supplyId || !form.value.batch || !form.value.expirationDate) {
    toastStore.push({
      title: 'Complete los campos obligatorios',
      description: 'Insumo, lote y fecha de vencimiento son requeridos.',
      type: 'error',
    });
    return;
  }

  if (form.value.quantity <= 0) {
    toastStore.push({
      title: 'Cantidad inválida',
      description: 'La cantidad recibida debe ser un número positivo.',
      type: 'error',
    });
    return;
  }

  const supplyId = form.value.supplyId;

  try {
    await appStore.submitBatch({ ...form.value });

    const insumo = listaInsumos.value.find((item) => Number(item.id) === Number(supplyId));

    toastStore.push({
      title: 'Reposición registrada',
      description: insumo
        ? `Stock de ${insumo.name}: ${insumo.quantity} uds.`
        : 'Entrada de mercancía guardada.',
      type: 'success',
    });

    resetForm();
  } catch {
    toastStore.push({
      title: 'Error al registrar entrada',
      description: 'No se pudo guardar el lote. Verifique la conexión con el servidor.',
      type: 'error',
    });
  }
};
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Reposición de Stock"
      subtitle="Registro de entrada de mercancía por lote."
    />

    <DashboardCard title="Entrada por lote" icon="notebook-pen">
      <form v-show="open" class="stack form-section" @submit.prevent="guardarEntrada">
        <label class="field field--required">
          <span class="field__label">Seleccionar insumo del catálogo</span>
          <select v-model="form.supplyId" class="select" required>
            <option value="" disabled>Seleccione un insumo del catálogo...</option>
            <option v-for="insumo in listaInsumos" :key="insumo.id" :value="insumo.id">
              {{ insumo.name }} (Stock actual: {{ insumo.quantity }} uds.)
            </option>
          </select>
        </label>

        <label class="field field--required">
          <span class="field__label">Cantidad recibida</span>
          <input
            class="input"
            v-model.number="form.quantity"
            type="number"
            min="1"
            required
            placeholder="1"
          />
        </label>

        <label class="field field--required">
          <span class="field__label">Número de lote</span>
          <input
            type="text"
            class="input"
            v-model="form.batch"
            placeholder="Ej: LOT-2026-AF"
            required
          />
        </label>

        <label class="field field--required">
          <span class="field__label">Fecha de vencimiento</span>
          <input
            type="date"
            class="input"
            v-model="form.expirationDate"
            :min="today"
            required
          />
        </label>

        <label class="field">
          <span class="field__label">Observaciones</span>
          <textarea
            class="textarea"
            v-model="form.observations"
            placeholder="Estado del empaque, temperatura, etc."
          />
        </label>

        <button class="btn btn--primary" type="submit" :disabled="batchLoading">
          {{ batchLoading ? 'Registrando…' : 'Registrar entrada' }}
        </button>
      </form>
    </DashboardCard>
  </div>
</template>

<style scoped>
.form-section {
  margin-top: 28px;
}
</style>

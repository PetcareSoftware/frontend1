<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/useAppStore';
import { useToastStore } from '@/stores/useToastStore';
import PageHeader from '@/components/shared/PageHeader.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { getSupply as getSupplyById, formatMoney } from '@/lib/petcare';
import { suggestReorderQuantity } from '@/lib/inventory';

const appStore = useAppStore();
const toastStore = useToastStore();
const route = useRoute();

const listaInsumos = computed(() => appStore.inventory);
const requisitionSubmitting = computed(() => appStore.status.requisition.submitting);

const form = ref({
  supplyId: '',
  quantity: 1,
});

const itemsSolicitados = ref([]);

const getSupply = (supplyId) => getSupplyById(listaInsumos, supplyId);

const getUnitCost = (insumo) => insumo?.unitCost || 0;

const formatUnitCost = (value) =>
  formatMoney(value, { locale: 'en-US', currency: 'USD', maximumFractionDigits: 2 });

const agregarInsumoALista = () => {
  if (!form.value.supplyId || form.value.quantity < 1) return;

  const id = Number(form.value.supplyId);
  const cantidad = Number(form.value.quantity);
  const existe = itemsSolicitados.value.find((item) => item.supplyId === id);

  if (existe) {
    existe.quantity += cantidad;
  } else {
    itemsSolicitados.value.push({ supplyId: id, quantity: cantidad });
  }

  form.value.supplyId = '';
  form.value.quantity = 1;
};

const quitarInsumo = (index) => {
  itemsSolicitados.value.splice(index, 1);
};

const gastoTotalPrevisto = computed(() =>
  itemsSolicitados.value.reduce((total, item) => {
    const supply = getSupply(item.supplyId);
    return total + item.quantity * getUnitCost(supply);
  }, 0)
);

const prefillFromCatalogAlert = () => {
  const supplyId = route.query.supplyId;
  if (!supplyId) return;

  const supply = getSupply(supplyId);
  if (!supply) return;

  const quantity = route.query.quantity
    ? Number(route.query.quantity)
    : suggestReorderQuantity(supply);

  form.value.supplyId = String(supply.id);
  form.value.quantity = Math.max(quantity, 1);

  if (route.query.auto === '1') {
    agregarInsumoALista();
  }
};

onMounted(() => {
  prefillFromCatalogAlert();
});

const enviarAlGerente = async () => {
  if (requisitionSubmitting.value || itemsSolicitados.value.length === 0) return;

  try {
    const created = await appStore.submitRequisition([...itemsSolicitados.value]);

    toastStore.push({
      title: 'Solicitud enviada',
      description: `Orden #${created.id} en estado Pendiente. El gerente la verá en su bandeja.`,
      type: 'success',
    });

    itemsSolicitados.value = [];
  } catch {
    toastStore.push({
      title: 'No se pudo enviar la solicitud',
      description: 'Verifique la conexión con el servidor e intente de nuevo.',
      type: 'error',
    });
  }
};
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Solicitud de reabastecimiento"
      subtitle="Generación de pedidos al gerente a partir del catálogo maestro."
    />

    <DashboardCard title="Nueva solicitud" icon="notebook-pen">
      <div class="stack form-section">
        <label class="field field--required">
          <span class="field__label">Seleccionar insumo del catálogo</span>
          <select v-model="form.supplyId" class="select" required>
            <option value="" disabled>Seleccione un insumo del catálogo...</option>
            <option v-for="insumo in listaInsumos" :key="insumo.id" :value="insumo.id">
              {{ insumo.name }} (Stock: {{ insumo.quantity }} uds. | {{ formatUnitCost(insumo.unitCost) }})
            </option>
          </select>
        </label>

        <label class="field">
          <span class="field__label">Cantidad deseada</span>
          <input
            class="input"
            v-model.number="form.quantity"
            type="number"
            min="1"
            required
            placeholder="1"
          />
        </label>

        <button
          class="btn btn--primary"
          type="button"
          :disabled="!form.supplyId"
          @click="agregarInsumoALista"
        >
          Agregar a la lista
        </button>
      </div>

      <div v-if="itemsSolicitados.length > 0" class="stack request-summary">
        <h3>Detalle de la solicitud actual</h3>

        <section class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th>Costo unitario</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in itemsSolicitados" :key="item.supplyId" class="table__row">
                <td>{{ getSupply(item.supplyId)?.name }}</td>
                <td>
                  <input
                    class="input quantity-input"
                    type="number"
                    v-model.number="item.quantity"
                    min="1"
                  />
                </td>
                <td>{{ formatUnitCost(getUnitCost(getSupply(item.supplyId))) }}</td>
                <td>
                  {{
                    formatUnitCost(item.quantity * getUnitCost(getSupply(item.supplyId)))
                  }}
                </td>
                <td>
                  <button type="button" class="btn btn--danger btn--sm" @click="quitarInsumo(index)">
                    Quitar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <div class="request-total">
          <span class="request-total__label">Gasto total previsto (precios oficiales):</span>
          <span class="request-total__value">{{ formatUnitCost(gastoTotalPrevisto) }}</span>
        </div>

        <button
          class="btn btn--primary request-submit"
          type="button"
          :disabled="requisitionSubmitting"
          @click="enviarAlGerente"
        >
          {{ requisitionSubmitting ? 'Enviando solicitud…' : 'Enviar al gerente' }}
        </button>
      </div>
    </DashboardCard>
  </div>
</template>

<style scoped>
.form-section {
  margin-top: 28px;
}

.request-summary {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.quantity-input {
  width: 5rem;
  padding: 6px 8px;
}

.request-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 16px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.03);
}

.request-total__label {
  color: rgba(61, 61, 61, 0.7);
}

.request-total__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-strong);
}

.request-submit {
  align-self: flex-end;
}

.btn--sm {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

.btn--danger {
  background: #e74c3c;
  color: #fff;
  border: none;
}
</style>

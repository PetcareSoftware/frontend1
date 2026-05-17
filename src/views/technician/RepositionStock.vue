<script setup>
import { ref, computed } from 'vue' 
import PageHeader from '@/components/shared/PageHeader.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore'; 

const appStore = useAppStore();

appStore.normalizeInventory();

  appStore.normalizeInventory();

// Variables de control 
const today = new Date().toISOString().split('T')[0];
const open = ref(true);
const alertMessage = ref(null);

// Estructura del formulario 
const form = ref({
  insumoId: '',
  quantity: 1,
  details: '',
  batch: '',
  expirationDate: '',
  observations: ''
});

// Catálogo dinámico conectado al almacén global de Pinia
const listaInsumos = computed(() => appStore.inventory || []);

const guardarEntrada = () => {
  // Validaciones del lado del cliente utilizando las nuevas variables en inglés
  if (!form.value.insumoId || !form.value.batch || !form.value.expirationDate) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }
  if (form.value.quantity <= 0) {
    alert("La cantidad recibida debe ser un número positivo.");
    return;
  }

  const insumoEncontrado = listaInsumos.value.find((item) => item.id === form.value.insumoId);
  if (!insumoEncontrado) return;

  const entrada = { ...form.value };
  const cantidad = Number(entrada.quantity);

  insumoEncontrado.quantity += cantidad;

  if (!insumoEncontrado.batches) {
    insumoEncontrado.batches = [];
  }

  insumoEncontrado.batches.push({
    batch: entrada.batch,
    expirationDate: entrada.expirationDate,
    quantity: cantidad,
  });

  insumoEncontrado.expirationDate = entrada.expirationDate;

  console.log('=== TRAZABILIDAD REGISTRADA ===');
  console.log(`Insumo: ${insumoEncontrado.name} (ID: ${insumoEncontrado.id})`);
  console.log(`Cantidad Sumada: ${cantidad}`);
  console.log(`Número de Lote: ${entrada.batch}`);
  console.log(`Fecha de Vencimiento: ${entrada.expirationDate}`);
  console.log(`Detalles Técnicos: ${entrada.details}`);
  console.log(`Observaciones: ${entrada.observations}`);
  console.log(`Nuevo Stock Total (Pinia): ${insumoEncontrado.quantity}`);

  alertMessage.value = `¡Reposición exitosa! El stock de ${insumoEncontrado.name} ahora es ${insumoEncontrado.quantity}`;
  setTimeout(() => (alertMessage.value = null), 3500);

  form.value = {
    insumoId: '',
    quantity: 1,
    details: '',
    batch: '',
    expirationDate: '',
    observations: '',
  };
};
</script>

<template>
  <div class="stack">
    <PageHeader 
      title="Reposición de Stock" 
      subtitle="Registro de entrada de mercancía por lote."
    />
    
    <DashboardCard title="Solicitud de insumos" icon="notebook-pen">
      <form v-show="open" class="stack" style="margin-top: 28px;" @submit.prevent="guardarEntrada">
        
        <div class="field">
          <label for="insumo">Seleccionar Insumo del Catálogo*</label>
          <select id="insumo" v-model="form.insumoId" class="select" required>
            <option value="" disabled>Seleccione un insumo del catálogo...</option>
            <option v-for="insumo in listaInsumos" :key="insumo.id" :value="insumo.id">
              {{ insumo.name }} (Stock actual: {{ insumo.quantity }} uds.)
            </option>
          </select>
        </div>
        
        <div class="field">
          <label for="cant">Cantidad Recibida*</label>
          <input class="input" id="cant" v-model="form.quantity" type="number" min="1" required placeholder="1"/>
        </div>
        
        <div class="field">
          <label for="detail">Detalles Técnicos*</label>
          <input class="input" id="detail" v-model="form.details" required placeholder="Descripción del insumo" />
        </div>
        
        <div class="field">
          <label for="lote">Número de Lote*</label>
          <input id="lote" type="text" class="input" v-model="form.batch" placeholder="Ej: LOT-2026-AF" required />
        </div>
        
        <div class="field">
          <label for="caducidad">Fecha de Vencimiento*</label>
          <input id="caducidad" type="date" class="input" v-model="form.expirationDate" :min="today" required />
        </div>
        
        <div class="field">
          <label for="observaciones">Observaciones de Control*</label>
          <textarea class="textarea" id="observaciones" v-model="form.observations" placeholder="Estado del empaque, temperatura, etc."/>
        </div>
        
        <button class="btn btn--primary" type="submit">Registrar Entrada</button>
      </form>
      
      <p v-if="alertMessage" class="chip chip--success" style="margin-top: 18px; display:inline-block;">
        {{ alertMessage }}
      </p>
    </DashboardCard>
  </div>
</template>
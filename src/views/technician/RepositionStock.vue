<script setup>
import { ref, computed } from 'vue' 
import PageHeader from '@/components/shared/PageHeader.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore'; 

const appStore = useAppStore();

if (!appStore.inventory || appStore.inventory.length === 0) {
  appStore.inventory = [
    { id: 1, name: 'Jeringas 5ml', quantity: 150, unitCost: 0.50, status: 'approved' },
    { id: 2, name: 'Vacuna Antirrábica', quantity: 20, unitCost: 15.00, status: 'pending' },
    { id: 3, name: 'Gasas Estériles (Caja)', quantity: 300, unitCost: 5.00, status: 'approved' },
    { id: 4, name: 'Anestesia General (Frasco)', quantity: 5, unitCost: 45.00, status: 'cancelled' }
  ];
}


// Variables de control en inglés
const today = new Date().toISOString().split('T')[0];
const open = ref(true);
const alertMessage = ref(null);

// Estructura del formulario completamente en inglés
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

  // Buscamos el insumo seleccionado en el inventario global
  const insumoEncontrado = listaInsumos.value.find(item => item.id === form.value.insumoId);

  if (insumoEncontrado) {
    // 1. Gestión de Estado Global (Pinia): Ambos usan .quantity ahora
    insumoEncontrado.quantity += Number(form.value.quantity);

    if(!insumoEncontrado.batches){
      insumoEncontrado.batches = [];
    }

    insumoEncontrado.batches.push({
      batch: form.value.batch,
      expirationDate: form.value.expirationDate,
      quantity: Number(form.value.quantity)
    });

    insumoEncontrado.expirationDate = form.value.expirationDate;
    
    alertMessage.value = `¡Reposición exitosa! El stock de ${insumoEncontrado.name} ahora es ${insumoEncontrado.quantity}`;
    setTimeout(() => (alertMessage.value = null), 3500);
    // 2. Alertas Automáticas (Status en inglés como en InventoryCatalog)
    form.value = {
    insumoId: '',
    quantity: 1,
    details: '',
    batch: '',
    expirationDate: '',
    observations: ''
    };

    // 3. Reporte de Trazabilidad en Consola
    console.log("=== TRAZABILIDAD REGISTRADA ===");
    console.log(`Insumo: ${insumoEncontrado.name} (ID: ${insumoEncontrado.id})`);
    console.log(`Cantidad Sumada: ${form.value.quantity}`);
    console.log(`Número de Lote: ${form.value.batch}`);
    console.log(`Fecha de Vencimiento: ${form.value.expirationDate}`);
    console.log(`Detalles Técnicos: ${form.value.details}`);
    console.log(`Observaciones: ${form.value.observations}`);
    console.log(`Nuevo Stock Total (Pinia): ${insumoEncontrado.quantity}`);

    // Mensaje de éxito visual
    alertMessage.value = `¡Reposición exitosa! El stock de ${insumoEncontrado.name} ahora es ${insumoEncontrado.quantity}`;
    setTimeout(() => (alertMessage.value = null), 3500);
    
    // Limpieza del formulario restableciendo el estado inicial en inglés
    form.value = {
      insumoId: '',
      quantity: 1,
      details: '',
      batch: '',
      expirationDate: '',
      observations: ''
    };
  }
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
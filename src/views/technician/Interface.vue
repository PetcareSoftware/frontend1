<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore' // Ajusta la ruta a tu store de Pinia
import PageHeader from '@/components/shared/PageHeader.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';


const appStore = useAppStore()

const listaInsumos = computed(() => appStore.inventory)

// 2. Estado local del formulario y del "carrito" temporal de la solicitud
const form = ref({
  insumoId: '',
  quantity: 1
})

const itemsSolicitados = ref([]) // Lista de insumos que el técnico va agregando
const alertMessage = ref('')

// Fecha de hoy para validaciones si fueran necesarias
const today = new Date().toISOString().split('T')[0]

// 3. Helper para buscar los datos oficiales de un insumo en el catálogo maestro
const obtenerDatosInsumo = (id) => {
  const insumoEncontrado = listaInsumos.value.find(insumo => insumo.id === Number(id))
  
  // 🚨 ESTO NOS VA A MOSTRAR EN LA CONSOLA CÓMO SE LLAMA TU PRECIO REAL:
  if (insumoEncontrado) {
    console.log("Insumo encontrado en Pinia:", insumoEncontrado)
  }
  
  return insumoEncontrado
}

// 4. Lógica para añadir un insumo a la lista temporal
const agregarInsumoALista = () => {
  if (!form.value.insumoId || form.value.quantity < 1) return

  const id = Number(form.value.insumoId)
  const cantidad = Number(form.value.quantity)
  
  const existe = itemsSolicitados.value.find(item => item.insumoId === id)

  if (existe) {
    existe.quantity += cantidad
  } else {
    itemsSolicitados.value.push({
      insumoId: id,
      quantity: cantidad
    })
  }

  form.value.insumoId = ''
  form.value.quantity = 1
}

// Quitar un insumo de la lista antes de enviar
const quitarInsumo = (index) => {
  itemsSolicitados.value.splice(index, 1)
}


const gastoTotalPrevisto = computed(() => {
  return itemsSolicitados.value.reduce((total, item) => {
    // Buscamos el insumo correspondiente en el catálogo maestro para saber su costo real
    const datosInsumo = obtenerDatosInsumo(item.insumoId);
    const precio = obtenerPrecioInsumo(datosInsumo);
    
    // Multiplicamos la cantidad ingresada por su costo unitario
    return total + (item.quantity * precio);
  }, 0);
});

// 6. FLUJO: Enviar al Gerente con Estado Inicial "Pendiente"
const enviarAlGerente = () => {
  if (itemsSolicitados.value.length === 0) return;

  // 1. Empaquetado: Creación del objeto de trazabilidad
  const nuevaSolicitud = {
    id: 'REQ-' + Date.now(), // ID único para el historial
    fecha: new Date().toLocaleDateString(),
    cantidadProductos: itemsSolicitados.value.reduce((acc, i) => acc + i.quantity, 0),
    total: gastoTotalPrevisto.value,
    estado: 'Pendiente', // <--- Requisito: Esta marca inicial activa el workflow
    items: [...itemsSolicitados.value] // Los datos necesarios para el Gerente
  };

  // 2. Registro: Se envía al store global
  appStore.addRequisition(nuevaSolicitud);

  // 3. Feedback Inmediato: Requisito 11.3
  alert("Solicitud enviada con éxito. Estado: Pendiente.");
  
  // 4. Limpieza del formulario
  itemsSolicitados.value = [];

  // Opcional: Limpiar el mensaje después de unos segundos
  setTimeout(() => { alertMessage.value = '' }, 3000);
};

const obtenerPrecioInsumo = (insumo) => {
  if (!insumo) return 0;
  return insumo.unitCost || 0; // <--- Apuntando al unitCost de tu catálogo
}; 

</script>

<template>
  <div class="stack">
    <PageHeader 
        title="Reabastecimiento de Clínica" 
        subtitle="Punto de entrada para la solicitud de insumos."

    />
    <DashboardCard title="Solicitud de insumos" icon="notebook-pen">
      <div class="stack" style="margin-top: 28px;">
        
        <div class="field">
          <label for="insumo">Seleccionar Insumo del Catálogo*</label>
          <select id="insumo" v-model="form.insumoId" class="select" required>
            <option value="" disabled>Seleccione un insumo del catálogo...</option>
            <option v-for="insumo in listaInsumos" :key="insumo.id" :value="insumo.id">
              {{ insumo.name }} (Stock actual: {{ insumo.quantity }} uds. | Costo: ${{ obtenerPrecioInsumo(insumo).toFixed(2) }} USD)
            </option>
          </select>
        </div>
        
        <div class="field">
          <label for="cant">Cantidad Deseada*</label>
          <input class="input" id="cant" v-model.number="form.quantity" type="number" min="1" required placeholder="1"/>
        </div>

        <button 
          class="btn btn--primary" 
          type="button" 
          @click="agregarInsumoALista"
          :disabled="!form.insumoId"
        >
          Agregar a la Lista
        </button>
      </div>

      <!-- Tabla de revisión y desglose matemático en tiempo real -->
      <div v-if="itemsSolicitados.length > 0" class="stack" style="margin-top: 32px; border-top: 1px solid var(--border-color, #eee); padding-top: 20px;">
        <h3>Detalle de la Solicitud Actual</h3>
        
        <table class="preview-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="text-align: left; border-bottom: 2px solid #ddd;">
              <th style="padding: 8px;">Insumo</th>
              <th style="padding: 8px;">Cantidad</th>
              <th style="padding: 8px;">Costo Unitario</th>
              <th style="padding: 8px;">Subtotal</th>
              <th style="padding: 8px;">Acción</th>
            </tr>
          </thead>
          <tbody>
  <tr v-for="(item, index) in itemsSolicitados" :key="item.insumoId" style="border-bottom: 1px solid #eee;">
    <td style="padding: 12px 8px;">
      {{ obtenerDatosInsumo(item.insumoId)?.name }}
    </td>
    
    <td style="padding: 12px 8px;">
      <input 
        class="input" 
        type="number" 
        v-model.number="item.quantity" 
        min="1" 
        style="width: 70px; padding: 6px; font-size: 14px;"
      />
    </td>

    <td style="padding: 12px 8px;">
      ${{ obtenerPrecioInsumo(obtenerDatosInsumo(item.insumoId)).toFixed(2) }} USD
    </td>

    <td style="padding: 12px 8px; font-weight: bold; color: #2c3e50;">
      ${{ (item.quantity * obtenerPrecioInsumo(obtenerDatosInsumo(item.insumoId))).toFixed(2) }} USD
    </td>

    <td style="padding: 12px 8px;">
      <button 
        type="button" 
        class="btn" 
        style="padding: 6px 12px; background: #ff4d4d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;" 
        @click="quitarInsumo(index)"
      >
        Quitar
      </button>
    </td>
  </tr>
</tbody>
        </table>

        
        <div class="total-highlight-container" style="background-color: rgba(0,0,0,0.03); padding: 16px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 14px; color: #666; display: block;">Resumen financiero (Precios Oficiales de Clínica):</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 16px; font-weight: 500; margin-right: 10px;">Gasto Total Previsto:</span>
            <span style="font-size: 24px; font-weight: bold; color: var(--color-primary, #2c3e50);">${{ gastoTotalPrevisto.toFixed(2) }} USD</span>
          </div>
        </div>


        <button class="btn btn--primary" type="button" @click="enviarAlGerente" style="margin-top: 16px; align-self: flex-end;">
          Enviar al Gerente
        </button>
      </div>
      
      <p v-if="alertMessage" class="chip chip--success" style="margin-top: 18px; display:inline-block;">
        {{ alertMessage }}
      </p>
    </DashboardCard>
  </div>
</template>
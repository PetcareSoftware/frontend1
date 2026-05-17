<script setup>
import { ref } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore';

const appStore = useAppStore();

// 2. Si el almacén no tiene datos de inventario todavía, le cargamos tu lista inicial por defecto
if (!appStore.inventory) {
  appStore.inventory = [
    { id: 1, name: 'Jeringas 5ml', quantity: 150, unitCost: 0.50, status: 'approved' },
    { id: 2, name: 'Vacuna Antirrábica', quantity: 20, unitCost: 15.00, status: 'pending' },
    { id: 3, name: 'Gasas Estériles (Caja)', quantity: 300, unitCost: 5.00, status: 'approved' },
    { id: 4, name: 'Anestesia General (Frasco)', quantity: 5, unitCost: 45.00, status: 'cancelled' }
  ];
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
    }).format(value);
};


//Fecha de vencimiento
const calcularDiasParaVencer = (fechaVencimiento) => {
    //Fecha base
    const hoy = new Date(); 
    
    const vencimiento = new Date(fechaVencimiento + 'T00:00:00'); 

    const diferenciaMs = vencimiento - hoy;
  return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
};


//Evaluacion de estado de cada producto
const evaluarEstadoProducto = (producto) => {
    let estadoVisual = 'normal'; 
    let mensajesTooltip = [];

    //Data en caso de emergencia por el error de la falta de el envio de la fecha de venc a pinia en form (cantidad minima de stock)
    const stock = producto.quantity || 0;
    const minimo = producto.umbral || 10; 

    //Evaluar Stock
    const limiteAmarilloStock = minimo * 1.5;

    if (stock <= minimo) {
        estadoVisual = 'critical';
        mensajesTooltip.push(`Stock crítico: Quedan ${stock} (Mínimo: ${minimo})`);
    } else if (stock <= limiteAmarilloStock) {
        estadoVisual = estadoVisual === 'critical' ? 'critical' : 'warning';
        mensajesTooltip.push(`Stock bajo: Quedan ${stock} (Mínimo: ${minimo})`);
    }

    //Evaluar Fechas de Vencimiento de los Lotes
    if (producto.batches && producto.batches.length > 0) {
        
        producto.batches.forEach(lote => {
            const diasRestantes = calcularDiasParaVencer(lote.expirationDate);

            if (diasRestantes <= 15) {
                estadoVisual = 'critical'; 
                mensajesTooltip.push(`El Lote #${lote.batch} pasó a estado crítico: Vence en ${diasRestantes} días`);
            
            } else if (diasRestantes <= 45) {
                estadoVisual = estadoVisual === 'critical' ? 'critical' : 'warning';
                mensajesTooltip.push(`Lote #${lote.batch} está próximo a vencer en ${diasRestantes} días`);
            }
        });
    }

    return {
        clase: estadoVisual,
        tooltip: mensajesTooltip.join(' | ')
    };
};

</script>

<template>
    <div class="stack">
    <PageHeader 
        title="Gestión de Insumos" 
        subtitle="Consulta de existencias y costos unitarios del inventario."
    />

    <DashboardCard title="Vista General del Inventario" icon="syringe">
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
        <thead style="background-color: #F7F1E6;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
            <th style="padding: 12px 8px;">Nombre del Insumo</th>
            <th style="padding: 12px 8px;">Cantidad Disponible</th>
            <th style="padding: 12px 8px;">Costo Unitario (USD)</th>
            </tr>
        </thead>
        <tbody>
            <tr 
                v-for="item in inventory" :key="item.id" 
                :class="`row-${evaluarEstadoProducto(item).clase}`" 
                style="border-bottom: 1px solid #e2e8f0;" 
            >
            <td style="padding: 12px 8px; font-weight: 500; position: relative;">
                {{ item.name }}
                
                <span 
                    v-if="evaluarEstadoProducto(item).clase !== 'normal'" 
                    class="alerta-tooltip"
                >
                    {{ evaluarEstadoProducto(item).tooltip }}
                </span>
            </td>
            <td style="padding: 12px 8px;">
                <!-- <StatusBadge :status="item.status" /> -->
                <span style="margin-left: 8px;">{{ item.quantity }} uds.</span>
            </td>
            <td style="padding: 12px 8px;">{{ formatCurrency(item.unitCost) }}</td>
            </tr>
        </tbody>
        </table>
    </DashboardCard>
    </div>
</template>

<style scoped>
/*Redondeo de los bordes superiores de la tabla*/
table {
    border-collapse: separate; 
    border-spacing: 0;
}

thead th {
    background-color: #F7F1E6;
}

thead th:first-child {
    border-top-left-radius: var(--radius-md);
}

thead th:last-child {
    border-top-right-radius: var(--radius-md);
}


/* colores de lineas de avisos */
.row-critical {
    background-color: #ffebee; 
    border-left: 4px solid #f44336; 
    cursor: help;
}

.row-warning {
    background-color: #fff8e1; 
    border-left: 4px solid #ffc107; 
    cursor: help;
}

.row-normal {
    background-color: transparent;
    border-left: 4px solid transparent;
}

/* alerta flotante */
.alerta-tooltip {
    visibility: hidden;
    opacity: 0;
    
    background-color: var(--bg);
    color: var(--text-strong);
    font-size: 13px;
    font-weight: 400;
    padding: 8px 12px;
    border-radius: 6px;
    white-space: nowrap;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    position: absolute;
    bottom: 80%;
    left: 10px;
    z-index: 50;
    
    /* Animación de aparición */
    transition: opacity 0.2s ease, bottom 0.2s ease;
    pointer-events: none; 
}

.alerta-tooltip::after {
    content: "";
    position: absolute;
    top: 100%; /* Abajo del globo */
    left: 15px; 
    border-width: 5px;
    border-style: solid;
    border-color: var(--bg) transparent transparent transparent;
}

tr:hover .alerta-tooltip {
    visibility: visible;
    opacity: 1;
    bottom: 100%;
}
</style>
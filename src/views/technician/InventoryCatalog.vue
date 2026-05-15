<script setup>
import { ref } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import DashboardCard from '@/components/shared/DashboardCard.vue';
import { useAppStore } from '@/stores/useAppStore';

const inventory = ref([
    { id: 1, name: 'Jeringas 5ml', quantity: 150, unitCost: 0.50, status: 'approved' },
    { id: 2, name: 'Vacuna Antirrábica', quantity: 20, unitCost: 15.00, status: 'pending' },
    { id: 3, name: 'Gasas Estériles (Caja)', quantity: 300, unitCost: 5.00, status: 'approved' },
    { id: 4, name: 'Anestesia General (Frasco)', quantity: 5, unitCost: 45.00, status: 'cancelled' }
]);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
    }).format(value);
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
            <tr v-for="item in inventory" :key="item.id" style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 8px; font-weight: 500;">{{ item.name }}</td>
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

</style>
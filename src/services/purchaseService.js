import api from './api';

const PURCHASE_ORDERS_BASE = 'purchase-orders/';
const SUPPLIERS_BASE = 'suppliers/';

/** Mapeo solicitud técnico → purchase order Django. */
function toPurchaseOrderPayload(order) {
  return {
    manager_id: order.manager_id ?? order.managerId ?? null,
    supplier_id: order.supplier_id ?? order.supplierId ?? null,
    status: order.status ?? 'REQUESTED',
    total_cost: order.total_cost ?? order.total ?? 0,
    items: (order.items ?? []).map((item) => ({
      supply_id: item.supply_id ?? item.supplyId ?? item.insumoId,
      quantity_requested: item.quantity_requested ?? item.quantity,
      unit_cost: item.unit_cost ?? item.unitCost ?? 0,
    })),
  };
}

export async function listPurchaseOrders(params = {}) {
  const response = await api.get(PURCHASE_ORDERS_BASE, { params });
  return response.data;
}

export async function getPurchaseOrder(orderId) {
  const response = await api.get(`${PURCHASE_ORDERS_BASE}${orderId}/`);
  return response.data;
}

export async function createPurchaseOrder(order) {
  const response = await api.post(PURCHASE_ORDERS_BASE, toPurchaseOrderPayload(order));
  return response.data;
}

export async function updatePurchaseOrder(orderId, order) {
  const response = await api.patch(
    `${PURCHASE_ORDERS_BASE}${orderId}/`,
    toPurchaseOrderPayload(order)
  );
  return response.data;
}

/**
 * Cambio de estado de solicitud (ej. Pendiente → Aprobada / Rechazada).
 * @param {string|number} orderId
 * @param {string} status - REQUESTED | APPROVED | RECEIVED | CANCELLED (o equivalentes del backend)
 */
export async function updatePurchaseOrderStatus(orderId, status) {
  const response = await api.patch(`${PURCHASE_ORDERS_BASE}${orderId}/`, { status });
  return response.data;
}

export async function listSuppliers(params = {}) {
  const response = await api.get(SUPPLIERS_BASE, { params });
  return response.data;
}

export async function getSupplier(supplierId) {
  const response = await api.get(`${SUPPLIERS_BASE}${supplierId}/`);
  return response.data;
}

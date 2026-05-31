import api from './api';

const SUPPLIES_BASE = 'supplies/';
const BATCHES_BASE = 'batches/';

/** Mapeo UI → payload Django para catálogo (supplies). */
function toSupplyPayload(supply) {
  return {
    sku: supply.sku,
    name: supply.name,
    description: supply.description ?? null,
    category: supply.category ?? supply.type,
    min_stock_alert: supply.min_stock_alert ?? supply.umbral ?? 0,
    unit_cost: supply.unit_cost ?? supply.unitCost ?? null,
  };
}

/** Mapeo UI → payload Django para reposición por lote (supply_batches). */
function toBatchPayload(batch) {
  return {
    supply_id: batch.supply_id ?? batch.supplyId ?? batch.insumoId,
    lot_number: batch.lot_number ?? batch.batchNumber ?? batch.batch,
    expiry_date: batch.expiry_date ?? batch.expiryDate ?? batch.expirationDate,
    quantity: batch.quantity,
    acquisition_cost: batch.acquisition_cost ?? batch.acquisitionCost ?? null,
    observations: batch.observations ?? null,
  };
}

export async function listSupplies(params = {}) {
  const response = await api.get(SUPPLIES_BASE, { params });
  return response.data;
}

export async function getSupply(supplyId) {
  const response = await api.get(`${SUPPLIES_BASE}${supplyId}/`);
  return response.data;
}

export async function createSupply(supply) {
  const response = await api.post(SUPPLIES_BASE, toSupplyPayload(supply));
  return response.data;
}

export async function updateSupply(supplyId, supply) {
  const response = await api.patch(`${SUPPLIES_BASE}${supplyId}/`, toSupplyPayload(supply));
  return response.data;
}

export async function replaceSupply(supplyId, supply) {
  const response = await api.put(`${SUPPLIES_BASE}${supplyId}/`, toSupplyPayload(supply));
  return response.data;
}

export async function deleteSupply(supplyId) {
  const response = await api.delete(`${SUPPLIES_BASE}${supplyId}/`);
  return response.data;
}

/** Registro de entrada de mercancía por lote (reposición). */
export async function createBatch(batch) {
  const response = await api.post(BATCHES_BASE, toBatchPayload(batch));
  return response.data;
}

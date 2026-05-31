import api from './api';

const CONSUME_BASE = 'consume/';

/**
 * Descuenta stock por consumo en consulta u operación clínica.
 * @param {{ supply_id: string|number, quantity: number, batch_id?: string|number, consultation_id?: string|number }} payload
 */
export async function consumeSupply(payload) {
  const body = {
    supply_id: payload.supply_id ?? payload.supplyId,
    quantity: payload.quantity,
    ...(payload.batch_id != null || payload.batchId != null
      ? { batch_id: payload.batch_id ?? payload.batchId }
      : {}),
    ...(payload.consultation_id != null || payload.consultationId != null
      ? { consultation_id: payload.consultation_id ?? payload.consultationId }
      : {}),
  };

  const response = await api.post(CONSUME_BASE, body);
  return response.data;
}

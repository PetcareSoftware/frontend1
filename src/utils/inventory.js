export const DEFAULT_INVENTORY_UMBRAL = 10;

export function getInventoryUmbral(item) {
  const raw = item?.umbral;
  if (raw != null && raw !== '' && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return DEFAULT_INVENTORY_UMBRAL;
}

/** Asegura umbral y batches en ítems creados antes de guardar umbral en el formulario. */
export function normalizeInventoryItem(item) {
  if (!item.batches) {
    item.batches = [];
  }
  item.umbral = getInventoryUmbral(item);
  return item;
}

export function normalizeInventory(inventory) {
  if (!Array.isArray(inventory)) return;
  inventory.forEach(normalizeInventoryItem);
}

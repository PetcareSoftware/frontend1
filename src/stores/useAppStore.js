import { defineStore } from 'pinia';
import { appTemplate } from '@/config/appTemplate';
import { normalizeInventory, normalizeInventoryItem } from '@/lib/inventory';
import {
  unwrapList,
  mapSupplyFromApi,
  mapPurchaseOrderToRequisition,
  mapRequisitionStatusToApi,
} from '@/lib/apiMappers';
import { listSupplies, createBatch } from '@/services/api/v1/inventoryService';
import {
  listPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
} from '@/services/api/v1/purchaseService';
import {
  vets as seedVets,
  owners as seedOwners,
  pets as seedPets,
  appointments as seedAppointments,
  consultations as seedConsultations,
  vaccines as seedVaccines,
  dewormings as seedDewormings,
  supplies as seedSupplies,
} from '@/data/mockData';

const clone = (value) => value.map((item) => ({ ...item }));

export const useAppStore = defineStore('app', {
  state: () => ({
    role: 'owner',
    currentUserId: 'o1',
    vets: clone(seedVets),
    owners: clone(seedOwners),
    pets: clone(seedPets),
    appointments: clone(seedAppointments),
    consultations: clone(seedConsultations),
    vaccines: clone(seedVaccines),
    dewormings: clone(seedDewormings),
    inventory: [],
    requisitions: [],
    status: {
      inventory: { loading: false },
      batch: { loading: false },
      requisition: { loading: false, submitting: false },
    },
    errors: {
      inventory: null,
    },
    purchaseOrderUpdatingId: null,
  }),
  getters: {
    currentOwner(state) {
      return state.owners.find((owner) => owner.id === state.currentUserId) || null;
    },
    roleInfo(state) {
      return appTemplate.roles[state.role];
    },
    roleNavigation(state) {
      return appTemplate.navigation[state.role];
    },
  },
  actions: {
    setRole(role, userId = undefined) {
      this.role = role;
      if (userId !== undefined) {
        this.currentUserId = userId;
      }
    },
    addOwner(owner) {
      this.owners.push(owner);
    },
    updateOwner(owner) {
      this.owners = this.owners.map((item) => (item.id === owner.id ? owner : item));
    },
    addPet(pet) {
      this.pets.push(pet);
    },
    updatePet(pet) {
      this.pets = this.pets.map((item) => (item.id === pet.id ? pet : item));
    },
    addAppointment(appointment) {
      this.appointments.push(appointment);
    },
    updateAppointment(appointment) {
      this.appointments = this.appointments.map((item) =>
        item.id === appointment.id ? appointment : item
      );
    },
    cancelAppointment(id) {
      this.appointments = this.appointments.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' } : item
      );
    },
    addConsultation(consultation) {
      this.consultations.push(consultation);
    },
    addVaccine(vaccine) {
      this.vaccines.push(vaccine);
    },
    addDeworming(deworming) {
      this.dewormings.push(deworming);
    },
    normalizeInventory() {
      normalizeInventory(this.inventory);
    },
    async fetchInventory() {
      this.status.inventory.loading = true;
      this.errors.inventory = null;

      try {
        const data = await listSupplies();
        this.inventory = unwrapList(data).map(mapSupplyFromApi);
      } catch (error) {
        this.errors.inventory = error?.message ?? 'No se pudo cargar el inventario';
      } finally {
        this.status.inventory.loading = false;
      }
    },
    addSupply(supply) {
      const item = normalizeInventoryItem(supply);
      this.inventory.push(item);
      return item;
    },
    async submitBatch({ supplyId, batch, expirationDate, quantity, observations }) {
      this.status.batch.loading = true;
      try {
        await createBatch({
          supply_id: Number(supplyId),
          lot_number: batch,
          expiry_date: expirationDate,
          quantity: Number(quantity),
          observations: observations || undefined,
        });
        await this.fetchInventory();
        return true;
      } finally {
        this.status.batch.loading = false;
      }
    },
    addBatch(supplyId, { batch, expirationDate, quantity }) {
      const item = this.inventory.find((entry) => Number(entry.id) === Number(supplyId));
      if (!item) return false;

      const amount = Number(quantity);
      item.quantity += amount;
      item.batches.push({
        batch,
        expirationDate,
        quantity: amount,
      });
      return true;
    },
    async fetchRequisitions() {
      this.status.requisition.loading = true;
      try {
        const data = await listPurchaseOrders();
        this.requisitions = unwrapList(data).map(mapPurchaseOrderToRequisition);
      } catch {
        // Mantiene solicitudes locales si la API no está disponible
      } finally {
        this.status.requisition.loading = false;
      }
    },
    addRequisition(requisition) {
      this.requisitions.push(requisition);
    },
    _buildPurchaseOrderPayload(items) {
      const orderItems = items.map((item) => {
        const supply = this.inventory.find(
          (entry) => Number(entry.id) === Number(item.supplyId)
        );
        const unitCost = supply?.unitCost ?? 0;
        return {
          supply_id: Number(item.supplyId),
          quantity_requested: Number(item.quantity),
          unit_cost: unitCost,
        };
      });
      const total_cost = orderItems.reduce(
        (sum, line) => sum + line.quantity_requested * line.unit_cost,
        0
      );
      return {
        status: 'REQUESTED',
        total_cost,
        items: orderItems,
      };
    },
    async submitRequisition(items) {
      if (!items?.length) {
        throw new Error('La solicitud debe incluir al menos un insumo');
      }

      this.status.requisition.submitting = true;
      try {
        const created = await createPurchaseOrder(this._buildPurchaseOrderPayload(items));
        const mapped = mapPurchaseOrderToRequisition(created);
        const existing = this.requisitions.findIndex((r) => r.id === mapped.id);
        if (existing >= 0) {
          this.requisitions[existing] = mapped;
        } else {
          this.requisitions.push(mapped);
        }
        return mapped;
      } finally {
        this.status.requisition.submitting = false;
      }
    },
    async updateRequisitionStatus(orderId, estado) {
      this.status.requisition.submitting = orderId;
      try {
        await updatePurchaseOrderStatus(orderId, mapRequisitionStatusToApi(estado));
        const solicitud = this.requisitions.find((s) => s.id === orderId);
        if (solicitud) {
          solicitud.estado = estado;
        }
      } finally {
        this.status.requisition.submitting = false;
      }
    },
  },
});

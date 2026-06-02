import {
  ValidationError, DATE_REGEXP, TIME_REGEXP
} from "./utils";


export class Appointment {
  id = '';
  petId = '';
  ownerId = '';
  vetId = '';
  slotId = null;
  date = '';
  time = '';
  reason = '';
  status = '';

  static STATUS = {
    scheduled: 'scheduled',
    confirmed: 'confirmed',
    waiting: 'waiting',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
  }

  static #API_STATUS_MAP = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'waiting',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };

  static #FRONTEND_STATUS_MAP = {
    scheduled: 'SCHEDULED',
    confirmed: 'CONFIRMED',
    waiting: 'CHECKED_IN',
    in_progress: 'CHECKED_IN',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
  };

  constructor({ id, petId, ownerId, vetId, slotId, date, time, reason, status }) {
    this.id = id;
    this.petId = petId || this.petId;
    this.ownerId = ownerId || this.ownerId;
    this.vetId = vetId;
    this.slotId = slotId;
    this.date = date || this.date;
    this.time = time || this.time;
    this.reason = reason || this.reason;
    this.status = status;
  }

  validate() {
    if (! this.petId) {
      throw new ValidationError('ID de mascota vacío', 'petId');
    }
    if (! this.ownerId) {
      throw new ValidationError('ID de propietario vacío', 'ownerId');
    }
    if (! DATE_REGEXP.test(this.date)) {
      throw new ValidationError('Fecha inválida', 'date');
    }
    if (! TIME_REGEXP.test(this.time)) {
      throw new ValidationError('Hora inválida', 'time');
    }
    if (! this.reason) {
      throw new ValidationError('Razón vacía', 'reason');
    }
    if (! (this.status in this.constructor.STATUS)) {
      throw new ValidationError('Estado inválido', 'status');
    }

    return true;
  }

  toApi() {
    const data = {
      slot_id: this.slotId,
      patient_id: this.petId,
      reason: this.reason,
    };

    return data;
  }

  static fromApi(data) {
    return new Appointment({
      id: data.id,
      petId: data.pet_id,
      ownerId: data.owner_id,
      vetId: data.vet_id,
      slotId: data.slot_id ?? null,
      date: data.date,
      time: data.time?.substring(0, 5) ?? data.time,
      reason: data.reason,
      status: Appointment.#API_STATUS_MAP[data.status] ?? data.status?.toLowerCase() ?? '',
    });
  }

  toApiStatus() {
    return Appointment.#FRONTEND_STATUS_MAP[this.status] ?? this.status?.toUpperCase() ?? '';
  }

  equals(other) {
    return this.id === other.id;
  }
}

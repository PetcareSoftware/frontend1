import { ValidationError } from "./utils";
import { Treatment } from "./treatment";


export class Vaccination extends Treatment {
  name = '';
  lot = '';
  notes = '';

  constructor({ id, petId, name, date, nextDate, appliedBy, lot, notes }) {
    super({ id, petId, date, nextDate, appliedBy });
    this.name = name || this.name;
    this.lot = lot || this.lot;
    this.notes = notes;
  }

  validate() {
    super.validate();

    if (! this.name) {
      throw new ValidationError('Nombre de vacuna vacío', 'name');
    }
    if (! this.lot) {
      throw new ValidationError('Número de lote vacío', 'lot');
    }
    if (this.notes && typeof this.notes !== 'string') {
      throw new ValidationError('Notas inválidas', 'notes');
    }

    return true;
  }

  toApi() {
    const data = {
      id: this.id,
      pet_id: this.petId,
      name: this.name,
      date: this.date,
      next_date: this.nextDate,
      applied_by: this.appliedBy,
      lot: this.lot,
      notes: this.notes,
    };

    return data;
  }

  toApiCreate() {
    const data = this.toApi();

    return {
      event_type: 'VACCINE',
      vaccine_name: data.name,
      dose: '',
      applied_date: data.date,
      sanitary_batch: data.lot,
      next_due_date: data.next_date,
    };
  }

  static fromApi(data, petId = '') {
    return new Vaccination({
      id: data.id,
      petId: petId,
      name: data.vaccine_name ?? data.event_type ?? '',
      date: data.applied_date,
      nextDate: data.next_due_date,
      appliedBy: data.appliedBy ?? '',
      lot: data.lot ?? '',
      notes: data.notes ?? '',
    });
  }

  equals(other) {
    return this.id === other.id || (
      this.petId === other.petId &&
      this.name.toLowerCase() === other.name.toLowerCase() &&
      this.date === other.date
    );
  }
}

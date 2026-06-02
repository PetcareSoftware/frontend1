import { ValidationError } from "./utils";
import { Treatment } from "./treatment";


export class Deworming extends Treatment {
  product = '';
  weight = 0;

  constructor({ id, petId, product, date, nextDate, appliedBy, weight }) {
    super({ id, petId, date, nextDate, appliedBy });
    this.product = product || this.product;
    this.weight = weight;
  }

  validate() {
    super.validate();

    if (! this.product) {
      throw new ValidationError('Producto vacío', 'product');
    }
    if (this.weight && !(typeof this.weight === 'number' && this.weight >= 0)) {
      throw new ValidationError('Peso inválida', 'weight');
    }

    return true;
  }

  toApi() {
    const data = {
      id: this.id,
      pet_id: this.petId,
      product: this.product,
      date: this.date,
      next_date: this.nextDate,
      applied_by: this.appliedBy,
      weight: this.weight,
    };

    return data;
  }

  static fromApi(data, petId = '') {
    return new Deworming({
      id: data.id,
      petId: petId,
      product: data.vaccine_name ?? data.event_type ?? '',
      date: data.applied_date,
      nextDate: data.next_due_date,
      appliedBy: data.appliedBy ?? '',
      weight: data.weight ?? 0,
    });
  }

  toApiCreate() {
    const data = this.toApi();

    return {
      event_type: 'DEWORMING',
      vaccine_name: data.product,
      dose: '',
      applied_date: data.date,
      sanitary_batch: '',
      next_due_date: data.next_date,
    };
  }

  equals(other) {
    return this.id === other.id || (
      this.petId === other.petId &&
      this.product.toLowerCase() === other.product.toLowerCase() &&
      this.date === other.date
    );
  }
}

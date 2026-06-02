import {
  ValidationError, NEG_NAME_REGEXP
} from './utils.js';


export class Veterinarian {
  id = '';
  name = '';
  specialty = '';
  avatar = '';

  constructor({ id, name, specialty, avatar }) {
    this.id = id;
    this.name = name || this.name;
    this.specialty = specialty || this.specialty;
    this.avatar = avatar;
  }

  validate() {
    if (NEG_NAME_REGEXP.test(this.name)) {
      throw new ValidationError('Nombre inválido', 'name');
    }
    if (NEG_NAME_REGEXP.test(this.specialty)) {
      throw new ValidationError('Especialidad inválida', 'specialty');
    }

    return true;
  }

  toApi() {
    const data = {
      id: this.id,
      name: this.name,
      specialty: this.specialty,
      avatar: this.avatar,
    };

    return data;
  }

  static fromApi(data) {
    return new Veterinarian({
      id: data.vet_id ?? data.id,
      name: data.vet_name ?? data.name ?? '',
      specialty: data.specialty ?? '',
      avatar: data.avatar ?? '',
    });
  }

  equals(other) {
    return this.id === other.id ||
      this.name.toLowerCase() === other.name.toLowerCase();
  }
}

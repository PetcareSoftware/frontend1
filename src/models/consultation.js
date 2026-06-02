import {
  ValidationError, DATE_REGEXP
} from "./utils";


export class Consultation {
  id = '';
  appointmentId = '';
  petId = '';
  vetId = '';
  date = '';
  weight = 0;
  temperature = 0;
  symptoms = '';
  diagnosis = '';
  treatment = '';
  prescriptions = [''];
  followUpDate = '';
  notes = '';

  constructor({
    id, appointmentId, petId, vetId, date, weight, temperature, symptoms, diagnosis,
    treatment, prescriptions, followUpDate, notes
  }) {
    this.id = id;
    this.appointmentId = appointmentId || this.appointmentId;
    this.petId = petId || this.petId;
    this.vetId = vetId || this.vetId;
    this.date = date || this.date;
    this.weight = weight;
    this.temperature = temperature;
    this.symptoms = symptoms || this.symptoms;
    this.diagnosis = diagnosis || this.diagnosis;
    this.treatment = treatment || this.treatment;
    this.prescriptions = prescriptions || [];
    this.followUpDate = followUpDate;
    this.notes = notes;
  }

  validate() {
    if (! this.appointmentId) {
      throw new ValidationError('ID de cita vacío', 'appointmentId');
    }
    if (! this.petId) {
      throw new ValidationError('ID de mascota vacío', 'petId');
    }
    if (! this.vetId) {
      throw new ValidationError('ID de veterinario vacío', 'vetId');
    }
    if (! DATE_REGEXP.test(this.date)) {
      throw new ValidationError('Fecha de consulta inválida', 'date');
    }
    if (this.weight && !(typeof this.weight === 'number' && this.weight >= 0)) {
      throw new ValidationError('Peso inválida', 'weight');
    }
    if (this.temperature && !(typeof this.temperature === 'number' && this.temperature >= -273.16)) {
      throw new ValidationError('Temperatura inválida', 'temperature');
    }
    if (! this.symptoms) {
      throw new ValidationError('Síntomas no están definidos', 'symptoms');
    }
    if (! this.diagnosis) {
      throw new ValidationError('Diagnóstico vacío', 'diagnosis');
    }
    if (! this.treatment) {
      throw new ValidationError('Tratamiento vacío', 'treatment');
    }
    if (! (this.prescriptions && this.prescriptions.every && this.prescriptions.every(p => p))) {
      throw new ValidationError('Prescripciones vacías', 'prescriptions');
    }
    if (this.followUpDate && ! DATE_REGEXP.test(this.followUpDate)) {
      throw new ValidationError('Fecha de próxima consulta inválida', 'date');
    }
    if (this.notes && typeof this.notes !== 'string') {
      throw new ValidationError('Notas inválidas', 'notes');
    }

    return true;
  }

  toApi() {
    const data = {
      id: this.id,
      appointment_id: this.appointmentId,
      pet_id: this.petId,
      vet_id: this.vetId,
      date: this.date,
      weight: this.weight,
      temperature: this.temperature,
      symptoms: this.symptoms,
      diagnosis: this.diagnosis,
      treatment: this.treatment,
      prescriptions: this.prescriptions,
      follow_up_date: this.followUpDate,
      notes: this.notes,
    };

    return data;
  }

  toApiCreate() {
    const data = this.toApi();

    return {
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      symptoms: data.symptoms,
      weight: data.weight,
      temperature: data.temperature,
      prescriptions: Array.isArray(data.prescriptions)
        ? data.prescriptions.join('\n')
        : (data.prescriptions ?? ''),
      notes: data.notes,
      follow_up_date: data.follow_up_date,
    };
  }

  static fromApi(data, { appointmentId = '', petId = '', vetId = '' } = {}) {
    return new Consultation({
      id: data.id ?? '',
      appointmentId: appointmentId,
      petId: petId,
      vetId: vetId,
      date: data.date ?? '',
      weight: data.weight != null ? Number(data.weight) : undefined,
      temperature: data.temperature != null ? Number(data.temperature) : undefined,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      prescriptions: typeof data.prescriptions === 'string'
        ? data.prescriptions.split('\n').filter(Boolean)
        : (data.prescriptions ?? []),
      followUpDate: data.follow_up_date,
      notes: data.notes,
    });
  }

  equals(other) {
    return this.id === other.id || (
      this.appointmentId === other.appointmentId && !!this.appointmentId
    );
  }
}

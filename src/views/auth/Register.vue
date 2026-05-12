<script setup>
  import { reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import Logo from '@/components/shared/Logo.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import { useToastStore } from '@/stores/useToastStore';

  const appStore = useAppStore();
  const toastStore = useToastStore();
  const router = useRouter();

  const form = reactive({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      toastStore.push({ title: 'Completa los campos requeridos', type: 'error' });
      return;
    }

    const newId = `o${Date.now()}`;

    appStore.addOwner({
      id: newId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    appStore.setRole('owner', newId);
    toastStore.push({
      title: `Bienvenido/a, ${form.name.split(' ')[0]}!`,
      description: 'Tu cuenta fue creada correctamente.',
      type: 'success',
    });
    router.push('/portal/dashboard');
  }
</script>

<template>
  <main class="auth-screen">
    <section class="auth-card card">
      <div class="auth-card__brand">
        <Logo size="lg" />
        <p class="muted">Sistema de gestión veterinaria PetCare</p>
      </div>

      <div class="section">
        <h1 class="section__title">Crear cuenta</h1>
        <p class="section__subtitle">
          Registrate como propietario de mascotas y comenzá a gestionar turnos.
        </p>
      </div>

      <form class="input-row" @submit.prevent="handleRegister">
        <label class="field">
          <span>Nombre completo *</span>
          <input v-model="form.name" class="input" type="text" placeholder="Ana García" />
        </label>

        <div class="input-grid">
          <label class="field">
            <span>Correo electrónico *</span>
            <input v-model="form.email" class="input" type="email" placeholder="ana@email.com" />
          </label>
          <label class="field">
            <span>Contraseña *</span>
            <input v-model="form.password" class="input" type="password" placeholder="••••••••" />
          </label>
        </div>

        <div class="input-grid">
          <label class="field">
            <span>Teléfono</span>
            <input v-model="form.phone" class="input" type="text" placeholder="555-0000" />
          </label>
          <label class="field">
            <span>Dirección</span>
            <input
              v-model="form.address"
              class="input"
              type="text"
              placeholder="Av. Libertad 123"
            />
          </label>
        </div>

        <button class="btn btn--primary" type="submit">Crear cuenta</button>
      </form>

      <p class="muted">Al registrarte aceptas los términos y condiciones de PetCare.</p>
    </section>
  </main>
</template>

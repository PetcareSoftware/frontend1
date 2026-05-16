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
    email: '',
    password: '',
  });

  function handleLogin() {
    if (!form.email || !form.password) {
      toastStore.push({ title: 'Completa todos los campos', type: 'error' });
      return;
    }

    // Lógica de simulación de login
    // En un proyecto real, aquí llamarías a una API
    
    // Buscamos si es un dueño
    const owner = appStore.owners.find(o => o.email === form.email);
    
    if (owner) {
      appStore.setRole('owner', owner.id);
      toastStore.push({
        title: `¡Hola de nuevo, ${owner.name.split(' ')[0]}!`,
        type: 'success',
      });
      router.push('/portal/dashboard');
      return;
    }

    // Simulamos login para otros roles (Veterinario/Recepcionista) por email
    if (form.email.includes('vet')) {
      appStore.setRole('vet', 'v1');
      toastStore.push({ title: 'Sesión iniciada como Veterinario', type: 'success' });
      router.push('/vet/dashboard');
      return;
    }

    if (form.email.includes('reception')) {
      appStore.setRole('receptionist', 'r1');
      toastStore.push({ title: 'Sesión iniciada como Recepcionista', type: 'success' });
      router.push('/reception/dashboard');
      return;
    }

    toastStore.push({
      title: 'Credenciales inválidas',
      description: 'Por favor, verifica tu email y contraseña.',
      type: 'error',
    });
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
        <h1 class="section__title">Iniciar sesión</h1>
        <p class="section__subtitle">
          Ingresá tus credenciales para acceder a tu panel de gestión.
        </p>
      </div>

      <form class="input-row" @submit.prevent="handleLogin">
        <label class="field">
          <span>Correo electrónico</span>
          <input v-model="form.email" class="input" type="email" placeholder="ejemplo@email.com" />
        </label>
        
        <label class="field">
          <span>Contraseña</span>
          <input v-model="form.password" class="input" type="password" placeholder="••••••••" />
        </label>

        <button class="btn btn--primary" type="submit">Entrar</button>
      </form>

      <div class="auth-footer">
        <p class="muted">¿No tienes una cuenta? 
          <router-link to="/register" class="link">Regístrate aquí</router-link>
        </p>
      </div>
      
      <!-- Nota informativa para desarrollo -->
      <div class="dev-note" style="margin-top: 2rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; font-size: 0.8rem;">
        <p><strong>Tips para desarrollo:</strong></p>
        <ul style="margin-left: 1.5rem; color: var(--text-muted);">
          <li>Cualquier email de dueño registrado funciona.</li>
          <li>Usa "vet@test.com" para entrar como Veterinario.</li>
          <li>Usa "reception@test.com" para entrar como Recepcionista.</li>
        </ul>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}
.link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}
.link:hover {
  text-decoration: underline;
}
</style>

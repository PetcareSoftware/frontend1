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
  <main class="auth-layout">
    <div class="auth-layout__visual">
      <div class="visual-decor visual-decor--1"></div>
      <div class="visual-decor visual-decor--2"></div>
      <div class="auth-layout__visual-content">
        <Logo size="lg" />
        <h2 class="visual-title">Gestión Veterinaria de Excelencia</h2>
        <p class="visual-text">Cuidamos a los que más quieres con tecnología de punta y el mejor equipo de profesionales.</p>
        
        <div class="visual-features">
          <div class="feature-item">
            <div class="feature-icon">✨</div>
            <span>Atención personalizada</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📅</div>
            <span>Gestión de turnos ágil</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">❤️</div>
            <span>Historial clínico detallado</span>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-layout__form">
      <div class="auth-container card">
        <div class="auth-header">
          <div class="logo-mobile">
            <Logo size="md" />
          </div>
          <h1 class="auth-title">Iniciar sesión</h1>
          <p class="auth-subtitle">Ingresá tus credenciales para acceder a tu panel.</p>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="field">
            <label class="field__label">Correo electrónico</label>
            <div class="input-wrapper">
              <input v-model="form.email" class="input input--auth" type="email" placeholder="ejemplo@email.com" />
            </div>
          </div>
          
          <div class="field">
            <label class="field__label">Contraseña</label>
            <div class="input-wrapper">
              <input v-model="form.password" class="input input--auth" type="password" placeholder="••••••••" />
            </div>
          </div>

          <button class="btn btn--primary btn--block" type="submit">Entrar a mi cuenta</button>
        </form>

        <div class="auth-footer">
          <p class="muted">¿No tienes una cuenta? 
            <router-link to="/register" class="link">Regístrate aquí</router-link>
          </p>
        </div>
        
        <div class="dev-note">
          <p class="dev-note__title"><strong>Tips para desarrollo:</strong></p>
          <ul class="dev-note__list">
            <li>Cualquier email de dueño registrado funciona.</li>
            <li>Usa "vet@test.com" para entrar como Veterinario.</li>
            <li>Usa "reception@test.com" para entrar como Recepcionista.</li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  background: var(--bg);
}

@media (min-width: 1024px) {
  .auth-layout {
    grid-template-columns: 1.2fr 1fr;
  }
}

.auth-layout__visual {
  display: none;
  background: linear-gradient(135deg, rgba(194, 167, 105, 0.05), rgba(165, 186, 142, 0.15)), var(--surface-soft);
  position: relative;
  overflow: hidden;
  border-right: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .auth-layout__visual {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.5rem;
  }
}

.visual-decor {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
}

.visual-decor--1 {
  top: -10%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: rgba(194, 167, 105, 0.2);
  animation: float 10s ease-in-out infinite alternate;
}

.visual-decor--2 {
  bottom: -10%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: rgba(165, 186, 142, 0.2);
  animation: float 12s ease-in-out infinite alternate-reverse;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

.auth-layout__visual-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
  margin: 0 auto;
}

.visual-title {
  font-size: clamp(2rem, 3.5vw, 2.5rem);
  margin: 1.5rem 0 1rem;
  line-height: 1.1;
  color: var(--text-strong);
  font-weight: var(--weight-black);
}

.visual-text {
  font-size: 1.1rem;
  color: var(--text);
  opacity: 0.85;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.visual-features {
  display: grid;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
}

.feature-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  font-size: 1.1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.feature-item span {
  font-weight: var(--weight-bold);
  color: var(--text-strong);
  font-size: 1rem;
}

.auth-layout__form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  padding: 2rem;
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.auth-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.logo-mobile {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

@media (min-width: 1024px) {
  .logo-mobile {
    display: none;
  }
}

.auth-title {
  font-size: 1.8rem;
  font-weight: var(--weight-black);
  color: var(--text-strong);
  margin-bottom: 0.25rem;
}

.auth-subtitle {
  color: var(--text);
  opacity: 0.7;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input--auth {
  padding: 0.85rem 1rem;
  font-size: 1rem;
  border-radius: 14px;
  background: #fff;
  transition: all 0.2s ease;
}

.input--auth:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(194, 167, 105, 0.15);
}

.btn--block {
  width: 100%;
  justify-content: center;
  padding: 0.85rem;
  font-size: 1.05rem;
  margin-top: 0.5rem;
  border-radius: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 15px rgba(194, 167, 105, 0.3);
}

.btn--block:hover {
  box-shadow: 0 6px 20px rgba(194, 167, 105, 0.4);
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}

.link {
  color: var(--brand-strong);
  font-weight: var(--weight-bold);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.link:hover {
  color: var(--brand);
  text-decoration: underline;
}

.dev-note {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(165, 186, 142, 0.1);
  border: 1px dashed rgba(165, 186, 142, 0.4);
  border-radius: 12px;
  font-size: 0.8rem;
}

.dev-note__title {
  margin: 0 0 0.5rem;
  color: var(--sage-strong);
}

.dev-note__list {
  margin: 0;
  padding-left: 1.25rem;
  color: rgba(61, 61, 61, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>

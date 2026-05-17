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
  <main class="auth-layout">
    <div class="auth-layout__visual">
      <div class="visual-decor visual-decor--1"></div>
      <div class="visual-decor visual-decor--2"></div>
      <div class="auth-layout__visual-content">
        <Logo size="lg" />
        <h2 class="visual-title">Únete a nuestra comunidad</h2>
        <p class="visual-text">Comienza a gestionar la salud de tus mascotas de manera simple y rápida.</p>
        
        <div class="visual-features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.55 3.55 0 0 1 2 13.5 5.5 5.5 0 0 1 9 10Z"/></svg>
            </div>
            <span>Perfiles de mascotas</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </div>
            <span>Recordatorios y alertas</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <span>Acceso 24/7 desde cualquier dispositivo</span>
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
          <h1 class="auth-title">Crear cuenta</h1>
          <p class="auth-subtitle">Registrate como propietario y comenzá a gestionar turnos.</p>
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="field">
            <label class="field__label">Nombre completo *</label>
            <input v-model="form.name" class="input input--auth" type="text" placeholder="Ana García" />
          </div>

          <div class="input-grid">
            <div class="field">
              <label class="field__label">Correo electrónico *</label>
              <input v-model="form.email" class="input input--auth" type="email" placeholder="ana@email.com" />
            </div>
            <div class="field">
              <label class="field__label">Contraseña *</label>
              <input v-model="form.password" class="input input--auth" type="password" placeholder="••••••••" />
            </div>
          </div>

          <div class="input-grid">
            <div class="field">
              <label class="field__label">Teléfono</label>
              <input v-model="form.phone" class="input input--auth" type="text" placeholder="555-0000" />
            </div>
            <div class="field">
              <label class="field__label">Dirección</label>
              <input v-model="form.address" class="input input--auth" type="text" placeholder="Av. Libertad 123" />
            </div>
          </div>

          <button class="btn btn--primary btn--block" type="submit">Crear cuenta</button>
        </form>

        <p class="terms muted">Al registrarte aceptas los términos y condiciones de PetCare.</p>

        <div class="auth-footer">
          <p class="muted">¿Ya tienes cuenta? 
            <router-link to="/login" class="link">Inicia sesión</router-link>
          </p>
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

.feature-icon svg {
  color: var(--brand-strong);
  width: 1.25rem;
  height: 1.25rem;
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

.terms {
  text-align: center;
  font-size: 0.8rem;
  margin-top: 1rem;
}
</style>

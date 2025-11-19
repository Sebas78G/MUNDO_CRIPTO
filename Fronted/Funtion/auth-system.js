// En auth-system.js - VERSIÓN MEJORADA
class AuthSystem {
    constructor() {
        this.api = window.apiSystem;
        this.init();
    }

    init() {
        console.log('🔐 Inicializando AuthSystem...');
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Botones de login/register
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showRegisterModal());
        
        // Forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Cerrar modales
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideModals());
        });
    }

    async checkExistingSession() {
        if (this.api && this.api.isAuthenticated()) {
            console.log('✅ Sesión existente encontrada');
            this.updateUI(this.api.getCurrentUser());
        }
    }

    showLoginModal() {
        this.hideModals();
        document.getElementById('loginModal').classList.add('active');
    }

    showRegisterModal() {
        this.hideModals();
        document.getElementById('registerModal').classList.add('active');
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.getElementById('loginSubmit');
        const errorDiv = document.getElementById('loginError');

        // Validación básica
        if (!this.api.validateEmail(email)) {
            this.showError(errorDiv, 'Email inválido');
            return;
        }

        if (!this.api.validatePassword(password)) {
            this.showError(errorDiv, 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';

            console.log('🔐 Intentando login...');
            const result = await this.api.login({ email, password });

            if (result.success) {
                console.log('✅ Login exitoso');
                this.hideModals();
                this.updateUI(result.user);
                this.showSuccess('¡Bienvenido!');
            } else {
                this.showError(errorDiv, result.message || 'Error en el login');
            }

        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showError(errorDiv, 'Error de conexión');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const submitBtn = document.getElementById('registerSubmit');
        const errorDiv = document.getElementById('registerError');

        // Validaciones
        if (!this.api.validateName(name)) {
            this.showError(errorDiv, 'El nombre debe tener al menos 2 caracteres');
            return;
        }

        if (!this.api.validateEmail(email)) {
            this.showError(errorDiv, 'Email inválido');
            return;
        }

        if (!this.api.validatePassword(password)) {
            this.showError(errorDiv, 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';

            console.log('👤 Intentando registro...');
            const result = await this.api.register({ name, email, password });

            if (result.success) {
                console.log('✅ Registro exitoso');
                this.hideModals();
                this.updateUI(result.user);
                this.showSuccess('¡Cuenta creada exitosamente!');
            } else {
                this.showError(errorDiv, result.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showError(errorDiv, 'Error de conexión');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrarse';
        }
    }

    updateUI(user) {
        if (user) {
            // Ocultar botones de login/register
            document.getElementById('authButtons')?.classList.add('hidden');
            
            // Mostrar información del usuario
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.innerHTML = `
                    <span>Bienvenido, ${user.name}</span>
                    <button onclick="authSystem.logout()" class="btn btn-outline">Cerrar Sesión</button>
                `;
            }
            
            // Actualizar header manager si existe
            if (window.headerManager) {
                window.headerManager.updateHeader();
            }
        } else {
            // Mostrar botones de login/register
            document.getElementById('authButtons')?.classList.remove('hidden');
            document.getElementById('userInfo')?.classList.add('hidden');
        }
    }

    logout() {
        if (this.api) {
            this.api.clearSession();
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.updateUI(null);
        this.showSuccess('¡Sesión cerrada!');
    }

    showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            setTimeout(() => errorElement.classList.add('hidden'), 5000);
        }
    }

    showSuccess(message) {
        // Puedes implementar notificaciones de éxito aquí
        console.log('✅ ' + message);
        alert(message); // Temporal - reemplazar con sistema de notificaciones
    }
}

// Inicialización
let authSystem;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Cargando AuthSystem...');
    
    const initAuth = () => {
        if (window.apiSystem) {
            authSystem = new AuthSystem();
            window.authSystem = authSystem;
            console.log('✅ AuthSystem inicializado correctamente');
        } else {
            console.log('⏳ Esperando apiSystem...');
            setTimeout(initAuth, 100);
        }
    };
    
    initAuth();
});
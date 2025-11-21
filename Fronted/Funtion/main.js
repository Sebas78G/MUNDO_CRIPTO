// main.js - Sistema principal que carga y coordina todos los módulos

console.log('🚀 Iniciando Mundo Cripto...');

class MainApp {
    constructor() {
        this.modules = {};
        this.api = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando Mundo Cripto...');
        
        try {
            // Cargar módulos externos
            await this.loadExternalModules();
            
            // CRÍTICO: Inicializar API primero
            await this.setupAPISystem();
            
            // Inicializar sistemas principales
            this.setupAuthSystem();
            this.setupNavigation();
            this.setupModals();
            this.checkExistingSession();
            
            // Inicializar sistemas de módulos
            await this.initModuleSystems();
            
            console.log('🎉 Todos los sistemas inicializados correctamente');
            
        } catch (error) {
            console.error('💥 Error durante la inicialización:', error);
        }
    }

    async loadExternalModules() {
        const moduleFiles = [
            '/Fronted/Funtion/api-system.js',  // ← API PRIMERO
            '/Fronted/Funtion/guide-buttons.js',
            '/Fronted/Funtion/news-system.js',
            '/Fronted/Funtion/market-system.js',
            '/Fronted/Funtion/education-system.js',
            '/Fronted/Funtion/auth-system.js'
        ];

        console.log('📦 Cargando módulos externos...');

        for (const moduleFile of moduleFiles) {
            try {
                await this.loadScript(moduleFile);
                console.log(`✅ ${moduleFile} cargado correctamente`);
            } catch (error) {
                console.error(`❌ Error cargando ${moduleFile}:`, error);
            }
        }
    }

    // NUEVO: Inicializar API System
    async setupAPISystem() {
        console.log('🔧 Inicializando API System...');
        
        // Esperar a que APISystem esté disponible
        let attempts = 0;
        while (!window.APISystem && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.APISystem) {
            this.api = new window.APISystem();
            window.apiSystem = this.api;
            console.log('✅ API System inicializado');
        } else {
            console.error('❌ No se pudo inicializar API System');
        }
    }

    // NUEVO: Configurar sistema de autenticación
    setupAuthSystem() {
        console.log('🔐 Configurando sistema de autenticación...');
        
        // Configurar event listeners para los botones
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openModal('loginModal'));
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.openModal('registerModal'));
        }
        
        // Configurar formularios
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        console.log('✅ Sistema de autenticación configurado');
    }

    async initModuleSystems() {
        console.log('🔄 Inicializando sistemas de módulos...');
        
        // Inicializar sistema educativo
        if (window.EducationSystem) {
            this.modules.education = new window.EducationSystem();
            await this.modules.education.init();
            console.log('✅ Sistema educativo inicializado');
        }

        // Inicializar otros sistemas
        if (window.newsSystem) {
            console.log('✅ Sistema de noticias inicializado');
        }
        
        if (window.marketSystem) {
            console.log('✅ Sistema de mercado inicializado');
        }

        if (window.guideButtonsSystem) {
            console.log('✅ Sistema de botones de guías inicializado');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(src);
            script.onerror = () => reject(new Error(`Error cargando ${src}`));
            document.body.appendChild(script);
        });
    }

    setupNavigation() {
        console.log('🧭 Configurando navegación...');
        
        // Scroll suave para enlaces internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Actualizar navegación activa
                    document.querySelectorAll('.nav-link').forEach(navLink => {
                        navLink.classList.remove('active');
                    });
                    link.classList.add('active');
                }
            }
        });

        // Botones del hero section
        const heroButtons = document.querySelectorAll('.hero-actions .btn');
        heroButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (index === 0) {
                    this.scrollToSection('mercado');
                } else {
                    this.scrollToSection('educacion');
                }
            });
        });
    }

    setupModals() {
        console.log('📱 Configurando modales...');
        
        // Cerrar modales con botón X
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Cerrar modal al hacer click fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openModal(modalId) {
        console.log('📱 Abriendo modal:', modalId);
        this.closeAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🚀 Procesando login...');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.getElementById('loginSubmit');
        const errorDiv = document.getElementById('loginError');

        // Validaciones
        if (!this.validateEmail(email)) {
            this.showError(errorDiv, 'Email inválido');
            return;
        }

        if (password.length < 6) {
            this.showError(errorDiv, 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Verificar que API está disponible
        if (!this.api) {
            this.showError(errorDiv, 'Sistema no inicializado. Por favor recarga la página.');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';

            const result = await this.api.login({ email, password });

            if (result.success) {
                console.log('✅ Login exitoso');
                this.closeModal('loginModal');
                this.onLoginSuccess(result.user);
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
        console.log('👤 Procesando registro...');
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const submitBtn = document.getElementById('registerSubmit');
        const errorDiv = document.getElementById('registerError');

        // Validaciones
        if (name.length < 2) {
            this.showError(errorDiv, 'El nombre debe tener al menos 2 caracteres');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError(errorDiv, 'Email inválido');
            return;
        }

        if (password.length < 6) {
            this.showError(errorDiv, 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Verificar que API está disponible
        if (!this.api) {
            this.showError(errorDiv, 'Sistema no inicializado. Por favor recarga la página.');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';

            console.log('📡 Enviando datos de registro:', { name, email });
            const result = await this.api.register({ name, email, password });

            if (result.success) {
                console.log('✅ Registro exitoso');
                this.closeModal('registerModal');
                this.onRegisterSuccess(result.user);
            } else {
                this.showError(errorDiv, result.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showError(errorDiv, 'Error de conexión con el servidor');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrarse';
        }
    }

    onLoginSuccess(user) {
        console.log('✅ Login exitoso:', user);
        this.currentUser = user;
        this.showMessage(`🎉 ¡Bienvenido de nuevo, ${user.name}!`, 'success');
        this.updateUIAfterAuth(user);
        this.saveSession(user);
    }

    onRegisterSuccess(user) {
        console.log('✅ Registro exitoso:', user);
        this.currentUser = user;
        this.showMessage(`🎉 ¡Cuenta creada exitosamente, ${user.name}!`, 'success');
        this.updateUIAfterAuth(user);
        this.saveSession(user);
    }

    async updateUIAfterAuth(user) {
        try {
            console.log('🔄 Actualizando UI con usuario:', user);
            
            const displayName = user.name || user.email || 'Usuario';
            
            const nav = document.querySelector('.nav');
            if (nav) {
                nav.innerHTML = `
                    <a href="/Fronted/Pages/graficos.html" class="nav-link">Gráficos</a>
                    <a href="/Fronted/Pages/Portafolio.html" class="nav-link">Portafolio</a>
                    <a href="#mercado" class="nav-link">Mercado</a>
                    <a href="#educacion" class="nav-link">Educación</a>
                    <div class="user-menu">
                        <span class="user-greeting">👋 Hola, ${displayName}</span>
                        <button id="logoutBtn" class="btn btn-outline">Cerrar Sesión</button>
                    </div>
                `;

                document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
                
                console.log('✅ UI actualizada correctamente');
            }
        } catch (error) {
            console.error('❌ Error actualizando UI:', error);
        }
    }

    handleLogout() {
        console.log('🚪 Cerrando sesión...');
        this.currentUser = null;
        this.clearSession();
        
        if (this.api) {
            this.api.clearSession();
        }
        
        this.showMessage('👋 Sesión cerrada correctamente', 'info');
        this.restoreAuthButtons();
    }

    restoreAuthButtons() {
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.innerHTML = `
                <a href="#inicio" class="nav-link active">Inicio</a>
                <a href="#noticias" class="nav-link">Noticias</a>
                <a href="#mercado" class="nav-link">Mercado</a>
                <a href="#educacion" class="nav-link">Educación</a>
                <div class="auth-buttons">
                    <button id="loginBtn" class="btn btn-outline">Iniciar Sesión</button>
                    <button id="registerBtn" class="btn btn-primary">Registrarse</button>
                </div>
            `;
            
            // Reconfigurar event listeners
            this.setupAuthSystem();
        }
    }

    saveSession(user) {
        localStorage.setItem('criptoUser', JSON.stringify(user));
        if (user.token) {
            localStorage.setItem('authToken', user.token);
        }
    }

    clearSession() {
        localStorage.removeItem('criptoUser');
        localStorage.removeItem('authToken');
    }

    async checkExistingSession() {
        const token = localStorage.getItem('authToken');
        
        if (token && this.api) {
            try {
                const result = await this.api.getProfile();
                if (result.success && result.user) {
                    this.currentUser = result.user;
                    this.updateUIAfterAuth(result.user);
                    console.log('✅ Sesión restaurada');
                }
            } catch (error) {
                console.log('⚠️ No se pudo restaurar la sesión');
                this.clearSession();
            }
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.classList.remove('hidden');
            setTimeout(() => {
                errorElement.style.display = 'none';
                errorElement.classList.add('hidden');
            }, 5000);
        }
    }

    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) existingMessage.remove();

        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-${type}`;
        messageEl.innerHTML = `
            <div class="auth-message-content">
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(messageEl);

        setTimeout(() => messageEl.classList.add('show'), 10);

        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) messageEl.remove();
            }, 300);
        }, 4000);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    window.mainApp = new MainApp();
});
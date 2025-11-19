// main.js - Sistema principal que carga y coordina todos los módulos

console.log('🚀 Iniciando Mundo Cripto...');
class MainApp {
    constructor() {
        this.modules = {};
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando Mundo Cripto...');
        
        try {
            // Cargar módulos externos
            await this.loadExternalModules();
            
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
            '/Fronted/Funtion/guide-buttons.js',
            '/Fronted/Funtion/news-system.js',
            '/Fronted/Funtion/market-system.js',
            '/Fronted/Funtion/education-system.js',
            '/Fronted/Funtion/api-system.js',
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

    async initModuleSystems() {
        console.log('🔄 Inicializando sistemas de módulos...');
        
        // Inicializar sistema educativo
        if (window.EducationSystem) {
            this.modules.education = new window.EducationSystem();
            await this.modules.education.init();
            console.log('✅ Sistema educativo inicializado');
        } else {
            console.error('❌ EducationSystem no disponible');
        }

        // Inicializar otros sistemas si existen
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

    async getUserProfileByEmail(email) {
    try {
        console.log('📡 Buscando perfil del usuario con email:', email);
        
        // Si tienes una API para obtener el perfil por email
        if (this.api && this.api.getUserByEmail) {
            const response = await this.api.getUserByEmail(email);
            if (response.success && response.user) {
                console.log('✅ Perfil encontrado:', response.user);
                return response.user;
            }
        }
        
        // Si no hay API específica, intenta con getProfile
        const response = await this.api.getProfile();
        if (response.success && response.user) {
            console.log('✅ Perfil obtenido:', response.user);
            return response.user;
        }
        
        console.warn('⚠️ No se pudo obtener el perfil completo');
        return null;
    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error);
        return null;
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

    setupAuthSystem() {
        console.log('🔐 Configurando sistema de autenticación...');
        
        // Botón de Iniciar Sesión
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('👆 Click en Iniciar Sesión');
                this.openModal('loginModal');
            });
        }

        // Botón de Registrarse
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                console.log('👆 Click en Registrarse');
                this.openModal('registerModal');
            });
        }

        // Formulario de Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Formulario de Registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Switch entre modales
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('loginModal');
            this.openModal('registerModal');
        });

        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('registerModal');
            this.openModal('loginModal');
        });
    }

    setupNavigation() {
        console.log('📍 Configurando navegación...');
        
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

    handleLogin(e) {
        e.preventDefault();
        console.log('🚀 Procesando login...');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!this.validateEmail(email)) {
            this.showMessage('❌ Por favor, introduce un email válido', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('❌ La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        this.showMessage('⏳ Iniciando sesión...', 'info');

        setTimeout(() => {
            const user = {
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                joinDate: new Date().toISOString()
            };
            
            this.currentUser = user;
            this.onLoginSuccess(user);
        }, 1500);
    }

    handleRegister(e) {
        e.preventDefault();
        console.log('🚀 Procesando registro...');
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (name.trim().length < 2) {
            this.showMessage('❌ El nombre debe tener al menos 2 caracteres', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage('❌ Por favor, introduce un email válido', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('❌ La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('❌ Las contraseñas no coinciden', 'error');
            return;
        }

        this.showMessage('⏳ Creando tu cuenta...', 'info');

        setTimeout(() => {
            const user = {
                id: Date.now(),
                name: name,
                email: email,
                joinDate: new Date().toISOString()
            };
            
            this.currentUser = user;
            this.onRegisterSuccess(user);
        }, 2000);
    }

    onLoginSuccess(user) {
        console.log('✅ Login exitoso:', user.name);
        this.showMessage(`🎉 ¡Bienvenido de nuevo, ${user.name}!`, 'success');
        this.closeModal('loginModal');
        this.updateUIAfterAuth(user);
        this.saveSession(user);
    }

    onRegisterSuccess(user) {
        console.log('✅ Registro exitoso:', user.name);
        this.showMessage(`🎉 ¡Cuenta creada exitosamente, ${user.name}!`, 'success');
        this.closeModal('registerModal');
        this.updateUIAfterAuth(user);
        this.saveSession(user);
    }

    async showUserMenu(user) {
    try {
        // Si el usuario no tiene nombre, buscarlo
        let userWithName = user;
        
        if (!user.name && user.email) {
            userWithName = await this.getUserProfileByEmail(user.email);
        }
        
        const displayName = userWithName?.name || user.email || 'Usuario';
        const userInitial = displayName.charAt(0).toUpperCase();
        
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="user-menu">
                    <div class="user-info">
                        <span class="user-greeting">Hola, ${displayName}</span>
                        <button class="user-avatar" id="userMenuBtn">
                            ${userInitial}
                        </button>
                    </div>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="dropdown-item" id="viewProfileBtn">
                            <i class="fas fa-user"></i>
                            <span>Ver Perfil</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Cerrar Sesión</span>
                        </div>
                    </div>
                </div>
            `;

            this.setupUserMenuListeners();
        }
    } catch (error) {
        console.error('❌ Error mostrando menú de usuario:', error);
    }
}

    async updateUIAfterAuth(user) {
    try {
        console.log('🔄 Actualizando UI con usuario:', user);
        
        // Si el usuario no tiene nombre, buscarlo en la base de datos
        let userWithName = user;
        
        if (!user.name && user.email) {
            console.log('🔍 Usuario sin nombre, buscando en BD...');
            userWithName = await this.getUserProfileByEmail(user.email);
        }
        
        // Si aún no tenemos nombre, usar el email o un valor por defecto
        const displayName = userWithName?.name || user.email || 'Usuario';
        
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.innerHTML = `
                 <a href="/Fronted/Pages/graficos.html" class="nav-link">Graficos</a>
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

            this.setupAuthSystem();
        }
    }

    saveSession(user) {
        localStorage.setItem('criptoUser', JSON.stringify(user));
    }

    clearSession() {
        localStorage.removeItem('criptoUser');
    }

    checkExistingSession() {
        const userData = localStorage.getItem('criptoUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.currentUser = user;
                this.updateUIAfterAuth(user);
            } catch (error) {
                this.clearSession();
            }
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
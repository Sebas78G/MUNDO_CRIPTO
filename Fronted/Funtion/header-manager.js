// header-manager.js - VERSIÓN CON PERSISTENCIA DE SESIÓN MEJORADA

class HeaderManager {
    constructor() {
        this.api = window.apiSystem;
        this.initialized = false;
        this.currentUser = null;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🔗 Inicializando HeaderManager...');
        
        // Esperar a que apiSystem esté disponible
        await this.waitForAPI();
        
        // Cargar usuario de múltiples fuentes
        await this.loadUser();
        
        // Actualizar header
        this.updateHeader();
        
        this.initialized = true;
        console.log('✅ HeaderManager inicializado');
    }

    async waitForAPI() {
        let attempts = 0;
        while (!window.apiSystem && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.apiSystem) {
            this.api = window.apiSystem;
            console.log('✅ API System conectado');
        } else {
            console.warn('⚠️ API System no disponible');
        }
    }

    async loadUser() {
        console.log('👤 Cargando usuario...');
        
        // Intentar 3 fuentes en orden de prioridad
        this.currentUser = 
            this.getUserFromLocalStorage() || 
            this.getUserFromSessionStorage() ||
            await this.getUserFromAPI();
        
        if (this.currentUser) {
            console.log('✅ Usuario cargado:', this.currentUser.name || this.currentUser.email);
            // Guardar en ambos storages para máxima persistencia
            this.saveUser(this.currentUser);
        } else {
            console.log('ℹ️ No hay usuario autenticado');
        }
    }

    getUserFromLocalStorage() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('💾 Usuario encontrado en localStorage');
                return user;
            }
        } catch (error) {
            console.error('❌ Error leyendo localStorage:', error);
        }
        return null;
    }

    getUserFromSessionStorage() {
        try {
            const userData = sessionStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('💾 Usuario encontrado en sessionStorage');
                return user;
            }
        } catch (error) {
            console.error('❌ Error leyendo sessionStorage:', error);
        }
        return null;
    }

    async getUserFromAPI() {
        if (!this.api) return null;
        
        try {
            // Verificar si hay token
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                console.log('ℹ️ No hay token de autenticación');
                return null;
            }

            // Intentar obtener perfil de la API
            if (typeof this.api.getProfile === 'function') {
                const response = await this.api.getProfile();
                if (response && response.success && response.user) {
                    console.log('✅ Usuario obtenido desde API');
                    return response.user;
                }
            }
        } catch (error) {
            console.error('❌ Error obteniendo usuario de API:', error);
        }
        
        return null;
    }

    saveUser(user) {
        try {
            const userData = JSON.stringify(user);
            // Guardar en ambos storages
            localStorage.setItem('currentUser', userData);
            sessionStorage.setItem('currentUser', userData);
            
            // También guardar el token si existe
            if (user.token) {
                localStorage.setItem('authToken', user.token);
                sessionStorage.setItem('authToken', user.token);
            }
            
            console.log('💾 Usuario guardado en storage');
        } catch (error) {
            console.error('❌ Error guardando usuario:', error);
        }
    }

    updateHeader() {
        const authContainer = document.querySelector('.auth-section');
        
        if (!authContainer) {
            console.log('⚠️ No se encontró .auth-section en esta página');
            return;
        }

        if (this.currentUser && (this.currentUser.name || this.currentUser.email)) {
            this.showUserHeader(authContainer);
        } else {
            this.showAuthButtons(authContainer);
        }
    }

    showUserHeader(container) {
        const displayName = this.currentUser.name || this.currentUser.email || 'Usuario';
        const initial = displayName.charAt(0).toUpperCase();
        
        container.innerHTML = `
            <div class="user-info">
                <span class="user-welcome">👋 Hola, ${displayName}</span>
                <button id="headerLogoutBtn" class="btn btn-outline">
                    <i class="fas fa-sign-out-alt"></i>
                    Cerrar Sesión
                </button>
            </div>
        `;

        // Configurar evento de logout
        const logoutBtn = document.getElementById('headerLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
            });
        }

        console.log('✅ Header de usuario mostrado');
    }

    showAuthButtons(container) {
        container.innerHTML = `
            <div class="auth-buttons">
                <button id="headerLoginBtn" class="btn btn-outline">
                    <i class="fas fa-sign-in-alt"></i>
                    Entrar
                </button>
                <button id="headerRegisterBtn" class="btn btn-primary">
                    <i class="fas fa-user-plus"></i>
                    Registrarse
                </button>
            </div>
        `;

        // Configurar eventos
        const loginBtn = document.getElementById('headerLoginBtn');
        const registerBtn = document.getElementById('headerRegisterBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = '/Fronted/index.html';
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                window.location.href = '/Fronted/index.html';
            });
        }

        console.log('✅ Botones de autenticación mostrados');
    }

    handleLogout() {
        console.log('🚪 Cerrando sesión...');
        
        // Confirmar con el usuario
        if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            return;
        }

        // Limpiar toda la información de sesión
        this.clearSession();
        
        // Limpiar sesión en API si está disponible
        if (this.api && typeof this.api.clearSession === 'function') {
            this.api.clearSession();
        }
        
        // Mostrar mensaje
        this.showNotification('👋 Sesión cerrada correctamente', 'info');
        
        // Esperar un poco antes de redirigir
        setTimeout(() => {
            window.location.href = '/Fronted/index.html';
        }, 1000);
    }

    clearSession() {
        try {
            // Limpiar localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userSession');
            
            // Limpiar sessionStorage
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userSession');
            
            // Resetear usuario actual
            this.currentUser = null;
            
            console.log('🧹 Sesión limpiada completamente');
        } catch (error) {
            console.error('❌ Error limpiando sesión:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Remover notificaciones existentes
        const existingNotifications = document.querySelectorAll('.header-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `header-notification header-notification-${type}`;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-width: 250px;
            text-align: center;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Método público para actualizar el usuario desde fuera
    updateUser(user) {
        if (user) {
            this.currentUser = user;
            this.saveUser(user);
            this.updateHeader();
            console.log('✅ Usuario actualizado en HeaderManager');
        }
    }

    // Método público para verificar si hay sesión
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Método público para obtener el usuario actual
    getCurrentUser() {
        return this.currentUser;
    }
}

// Función global para acceder al HeaderManager desde cualquier lugar
window.getHeaderManager = function() {
    if (!window.headerManager) {
        window.headerManager = new HeaderManager();
    }
    return window.headerManager;
};

// Función global para actualizar el header cuando el usuario inicia sesión
window.updateHeaderWithUser = function(user) {
    const headerManager = window.getHeaderManager();
    headerManager.updateUser(user);
};

// Función global para verificar si hay sesión
window.isUserLoggedIn = function() {
    const headerManager = window.getHeaderManager();
    return headerManager.isLoggedIn();
};

// Inicialización automática
function initHeaderManager() {
    console.log('🔗 Preparando HeaderManager...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const headerManager = window.getHeaderManager();
                headerManager.init();
            }, 100);
        });
    } else {
        setTimeout(() => {
            const headerManager = window.getHeaderManager();
            headerManager.init();
        }, 100);
    }
}

// Iniciar
initHeaderManager();

// Escuchar eventos de login desde otras partes de la aplicación
window.addEventListener('userLoggedIn', (event) => {
    console.log('🔔 Evento userLoggedIn recibido');
    if (event.detail && event.detail.user) {
        window.updateHeaderWithUser(event.detail.user);
    }
});

// Escuchar eventos de logout
window.addEventListener('userLoggedOut', () => {
    console.log('🔔 Evento userLoggedOut recibido');
    const headerManager = window.getHeaderManager();
    headerManager.clearSession();
    headerManager.updateHeader();
});

console.log('✅ Header Manager Script cargado');
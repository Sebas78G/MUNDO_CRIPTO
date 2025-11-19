// header-manager.js - VERSIÓN CORREGIDA Y OPTIMIZADA
class HeaderManager {
    constructor() {
        this.api = window.apiSystem;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🔗 Inicializando HeaderManager...');
        await this.updateHeader();
        this.initialized = true;
    }

    async updateHeader() {
        try {
            // Esperar un poco para que la página cargue completamente
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const user = await this.getCurrentUser();
            this.renderHeader(user);
        } catch (error) {
            console.error('❌ Error en header:', error);
            this.showAuthButtons();
        }
    }

    async getCurrentUser() {
        // Intentar con localStorage primero (más rápido)
        const localUser = localStorage.getItem('currentUser');
        if (localUser) {
            try {
                return JSON.parse(localUser);
            } catch (e) {
                console.warn('⚠️ Error parseando usuario de localStorage:', e);
                localStorage.removeItem('currentUser');
            }
        }

        // Si no hay en localStorage, intentar con API
        if (this.api && typeof this.api.isAuthenticated === 'function' && this.api.isAuthenticated()) {
            try {
                const response = await this.api.getProfile();
                if (response && response.success && response.user) {
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    return response.user;
                }
            } catch (error) {
                console.error('❌ Error obteniendo usuario de API:', error);
            }
        }

        return null;
    }

    renderHeader(user) {
        const authContainer = document.querySelector('.auth-section');
        
        if (!authContainer) {
            console.log('⚠️ No se encontró .auth-section en esta página');
            return;
        }

        if (user && user.name) {
            this.showUserHeader(authContainer, user);
        } else {
            this.showAuthButtons(authContainer);
        }
    }

    showUserHeader(container, user) {
        container.innerHTML = `
            <div class="user-info">
                <span class="user-welcome">👋 ${user.name}</span>
                <button id="headerLogoutBtn" class="btn btn-outline">
                    <i class="fas fa-sign-out-alt"></i>
                    Salir
                </button>
            </div>
        `;

        const logoutBtn = document.getElementById('headerLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
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

        document.getElementById('headerLoginBtn')?.addEventListener('click', () => {
            window.location.href = '/Fronted/index.html';
        });

        document.getElementById('headerRegisterBtn')?.addEventListener('click', () => {
            window.location.href = '/Fronted/index.html';
        });
    }

    handleLogout() {
        console.log('🚪 Cerrando sesión...');
        
        if (this.api && typeof this.api.clearSession === 'function') {
            this.api.clearSession();
        }
        
        // Limpiar todo el localStorage relacionado
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('portfolio_backup');
        localStorage.removeItem('userSession');
        
        // Redirigir al inicio
        window.location.href = '/Fronted/index.html';
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 Cargando HeaderManager...');
    
    // Esperar a que la página esté completamente cargada
    setTimeout(() => {
        window.headerManager = new HeaderManager();
        
        // Intentar inicializar, si falla, reintentar
        const initHeader = () => {
            try {
                window.headerManager.init();
                console.log('✅ HeaderManager inicializado correctamente');
            } catch (error) {
                console.error('❌ Error inicializando HeaderManager:', error);
                // Reintentar después de 1 segundo
                setTimeout(initHeader, 1000);
            }
        };
        
        initHeader();
    }, 500);
});
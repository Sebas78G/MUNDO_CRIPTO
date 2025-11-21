// perfil.js - VERSIÓN COMPLETAMENTE FUNCIONAL

class ProfileManager {
    constructor() {
        this.api = window.apiSystem;
        this.currentUser = null;
    }

    async init() {
        console.log('👤 Inicializando ProfileManager...');
        
        // Esperar a que API esté disponible
        await this.waitForAPI();
        
        // Cargar usuario
        await this.loadUser();
        
        // Verificar autenticación
        if (!this.currentUser) {
            console.log('❌ Usuario no autenticado, redirigiendo...');
            this.redirectToIndex();
            return;
        }
        
        // Configurar página
        this.setupEventListeners();
        this.displayUserData();
        
        console.log('✅ ProfileManager inicializado correctamente');
    }

    async waitForAPI() {
        let attempts = 0;
        while (!window.apiSystem && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.apiSystem) {
            this.api = window.apiSystem;
            console.log('✅ API conectada');
        } else {
            console.warn('⚠️ API no disponible');
        }
    }

    async loadUser() {
        console.log('📥 Cargando usuario...');
        
        // Intentar 3 fuentes
        this.currentUser = 
            this.getUserFromLocalStorage() ||
            this.getUserFromSessionStorage() ||
            await this.getUserFromAPI();
        
        if (this.currentUser) {
            console.log('✅ Usuario cargado:', this.currentUser);
        } else {
            console.log('❌ No se pudo cargar usuario');
        }
    }

    getUserFromLocalStorage() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                return JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error leyendo localStorage:', error);
        }
        return null;
    }

    getUserFromSessionStorage() {
        try {
            const userData = sessionStorage.getItem('currentUser');
            if (userData) {
                return JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error leyendo sessionStorage:', error);
        }
        return null;
    }

    async getUserFromAPI() {
        if (!this.api) return null;
        
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) return null;

            if (typeof this.api.getProfile === 'function') {
                const response = await this.api.getProfile();
                if (response && response.success && response.user) {
                    return response.user;
                }
            }
        } catch (error) {
            console.error('Error obteniendo usuario de API:', error);
        }
        
        return null;
    }

    setupEventListeners() {
        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.showLogoutModal();
            });
        }

        // Modal de logout
        const confirmLogout = document.getElementById('confirmLogout');
        const cancelLogout = document.getElementById('cancelLogout');
        const logoutModal = document.getElementById('logoutModal');

        if (confirmLogout) {
            confirmLogout.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        if (cancelLogout) {
            cancelLogout.addEventListener('click', () => {
                this.hideLogoutModal();
            });
        }

        if (logoutModal) {
            logoutModal.addEventListener('click', (e) => {
                if (e.target === logoutModal) {
                    this.hideLogoutModal();
                }
            });
        }

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLogoutModal();
            }
        });

        // Botones de configuración (placeholder)
        const settingBtns = document.querySelectorAll('.setting-btn');
        settingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showMessage('🚧 Función en desarrollo', 'info');
            });
        });

        console.log('✅ Event listeners configurados');
    }

    displayUserData() {
        if (!this.currentUser) {
            console.error('❌ No hay usuario para mostrar');
            return;
        }

        console.log('👤 Mostrando datos del usuario...');
        
        const displayName = this.currentUser.name || this.currentUser.email || 'Usuario';
        const email = this.currentUser.email || 'email@ejemplo.com';
        const initial = displayName.charAt(0).toUpperCase();

        // Mostrar nombre en el header
        const userNameElements = document.querySelectorAll('#userName');
        userNameElements.forEach(element => {
            element.textContent = displayName;
        });

        // Mostrar inicial del avatar
        const userInitial = document.getElementById('userInitial');
        if (userInitial) {
            userInitial.textContent = initial;
        }

        // Mostrar mensaje de bienvenida
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Bienvenido, ${displayName}`;
        }

        // Mostrar email
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = email;
        }

        // Mostrar fecha de registro
        const memberSince = document.getElementById('memberSince');
        if (memberSince) {
            if (this.currentUser.createdAt) {
                const date = new Date(this.currentUser.createdAt);
                memberSince.textContent = date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                memberSince.textContent = new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        }

        // Aplicar color al avatar
        this.applyAvatarColor();

        // Cargar estadísticas del portafolio
        this.loadPortfolioStats();

        console.log('✅ Datos del usuario mostrados');
    }

    applyAvatarColor() {
        const avatar = document.querySelector('.avatar');
        if (!avatar || !this.currentUser) return;

        const colors = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)'
        ];

        const name = this.currentUser.name || this.currentUser.email || 'User';
        const hash = name.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const colorIndex = Math.abs(hash) % colors.length;
        avatar.style.background = colors[colorIndex];
    }

    loadPortfolioStats() {
        try {
            // Cargar estadísticas del portafolio desde localStorage
            const portfolioState = localStorage.getItem('crypto_portfolio_state');
            
            if (portfolioState) {
                const portfolio = JSON.parse(portfolioState);
                
                // Actualizar estadísticas en las tarjetas
                const statValues = document.querySelectorAll('.stat-value');
                
                if (statValues.length >= 2) {
                    // Valor del portafolio
                    const totalValue = (portfolio.availableBalance || 0) + 
                                      (portfolio.investments || []).reduce((sum, inv) => 
                                          sum + (inv.currentValue || 0), 0);
                    statValues[0].textContent = `$${totalValue.toFixed(2)}`;
                    
                    // Número de inversiones
                    statValues[1].textContent = (portfolio.investments || []).length;
                }
                
                console.log('✅ Estadísticas del portafolio cargadas');
            } else {
                console.log('ℹ️ No hay estadísticas de portafolio disponibles');
            }
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
        }
    }

    showLogoutModal() {
        console.log('📋 Mostrando modal de logout');
        const modal = document.getElementById('logoutModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideLogoutModal() {
        console.log('❌ Ocultando modal de logout');
        const modal = document.getElementById('logoutModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    handleLogout() {
        console.log('🚪 Cerrando sesión...');
        
        // Limpiar sesión
        this.clearSession();
        
        if (this.api && typeof this.api.clearSession === 'function') {
            this.api.clearSession();
        }
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        
        // Mostrar mensaje
        this.showMessage('👋 Sesión cerrada correctamente', 'success');
        
        // Redirigir
        setTimeout(() => {
            this.redirectToIndex();
        }, 1000);
        
        this.hideLogoutModal();
    }

    clearSession() {
        try {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('authToken');
            console.log('🧹 Sesión limpiada');
        } catch (error) {
            console.error('❌ Error limpiando sesión:', error);
        }
    }

    redirectToIndex() {
        console.log('🔄 Redirigiendo al index...');
        window.location.href = '/Fronted/index.html';
    }

    showMessage(message, type = 'info') {
        const existingMessages = document.querySelectorAll('.profile-message');
        existingMessages.forEach(msg => msg.remove());

        const messageEl = document.createElement('div');
        messageEl.className = `profile-message profile-${type}`;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;

        const messageContent = document.createElement('div');
        messageContent.style.cssText = `
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            background: ${colors[type] || colors.info};
            color: white;
            min-width: 250px;
            text-align: center;
        `;
        messageContent.textContent = message;
        
        messageEl.appendChild(messageContent);
        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-20px)';
            setTimeout(() => messageEl.remove(), 300);
        }, 4000);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Inicializando página de perfil...');
    
    // Crear instancia del ProfileManager
    window.profileManager = new ProfileManager();
    
    // Inicializar después de un pequeño delay
    setTimeout(() => {
        window.profileManager.init();
    }, 100);
});

console.log('✅ perfil.js cargado');
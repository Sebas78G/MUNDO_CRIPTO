// perfil.js - Gestión de la página de perfil
class ProfileManager {
    constructor() {
        this.api = window.apiSystem;
        this.init();
    }

    init() {
        console.log('👤 Inicializando ProfileManager...');
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadUserData();
    }

    checkAuthentication() {
        if (!this.api || !this.api.isAuthenticated()) {
            console.log('❌ Usuario no autenticado, redirigiendo...');
            this.redirectToIndex();
            return;
        }
        console.log('✅ Usuario autenticado');
    }

    setupEventListeners() {
        // Botón de cerrar sesión
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.showLogoutModal();
        });

        // Modal de confirmación de logout
        document.getElementById('confirmLogout').addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('cancelLogout').addEventListener('click', () => {
            this.hideLogoutModal();
        });

        // Cerrar modal al hacer click fuera
        document.getElementById('logoutModal').addEventListener('click', (e) => {
            if (e.target.id === 'logoutModal') {
                this.hideLogoutModal();
            }
        });

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLogoutModal();
            }
        });
    }

    async loadUserData() {
        try {
            console.log('📥 Cargando datos del usuario...');
            const response = await this.api.getProfile();
            
            if (response.success && response.user) {
                this.displayUserData(response.user);
            } else {
                console.error('❌ Error al cargar datos del usuario:', response.message);
                this.showMessage('Error al cargar datos del perfil', 'error');
            }
        } catch (error) {
            console.error('❌ Error en loadUserData:', error);
            this.showMessage('Error de conexión al cargar perfil', 'error');
        }
    }

    displayUserData(user) {
        console.log('👤 Mostrando datos del usuario:', user);
        
        // Mostrar nombre en el header
        const userNameElements = document.querySelectorAll('#userName');
        userNameElements.forEach(element => {
            element.textContent = user.name || 'Usuario';
        });

        // Mostrar inicial del avatar
        const userInitial = document.getElementById('userInitial');
        if (userInitial && user.name) {
            userInitial.textContent = user.name.charAt(0).toUpperCase();
        }

        // Mostrar mensaje de bienvenida
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage && user.name) {
            welcomeMessage.textContent = `Bienvenido, ${user.name}`;
        }

        // Mostrar email
        const userEmail = document.getElementById('userEmail');
        if (userEmail && user.email) {
            userEmail.textContent = user.email;
        }

        // Mostrar fecha de registro (si está disponible)
        const memberSince = document.getElementById('memberSince');
        if (memberSince) {
            memberSince.textContent = user.createdAt ? 
                new Date(user.createdAt).toLocaleDateString('es-ES') : 'Hoy';
        }

        // Aplicar color al avatar basado en el nombre
        this.applyAvatarColor(user);
    }

    applyAvatarColor(user) {
        const avatar = document.querySelector('.avatar');
        if (!avatar || !user.name) return;

        const colors = [
            'linear-gradient(135deg, #007bff, #0056b3)',
            'linear-gradient(135deg, #28a745, #1e7e34)',
            'linear-gradient(135deg, #dc3545, #c82333)',
            'linear-gradient(135deg, #ffc107, #e0a800)',
            'linear-gradient(135deg, #6f42c1, #5a2d91)'
        ];

        // Generar índice de color basado en el nombre
        const name = user.name;
        const hash = name.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        const colorIndex = Math.abs(hash) % colors.length;
        
        avatar.style.background = colors[colorIndex];
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
        this.api.clearSession();
        
        // Mostrar mensaje
        this.showMessage('👋 Sesión cerrada correctamente', 'success');
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            this.redirectToIndex();
        }, 1000);
        
        this.hideLogoutModal();
    }

    redirectToIndex() {
        console.log('🔄 Redirigiendo al index...');
        window.location.href = '/Fronted/index.html'; // Ajusta la ruta según tu estructura
    }

    showMessage(message, type = 'info') {
        // Remover mensajes existentes
        const existingMessages = document.querySelectorAll('.profile-message');
        existingMessages.forEach(msg => msg.remove());

        const messageEl = document.createElement('div');
        messageEl.className = `profile-message profile-${type}`;
        messageEl.innerHTML = `
            <div class="profile-message-content">
                <span>${message}</span>
            </div>
        `;
        
        // Estilos inline para el mensaje
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;

        const messageContent = messageEl.querySelector('.profile-message-content');
        messageContent.style.cssText = `
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 250px;
            text-align: center;
        `;

        // Colores según el tipo
        if (type === 'success') {
            messageContent.style.background = '#d4edda';
            messageContent.style.color = '#155724';
            messageContent.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            messageContent.style.background = '#f8d7da';
            messageContent.style.color = '#721c24';
            messageContent.style.border = '1px solid #f5c6cb';
        } else {
            messageContent.style.background = '#d1ecf1';
            messageContent.style.color = '#0c5460';
            messageContent.style.border = '1px solid #bee5eb';
        }

        document.body.appendChild(messageEl);

        // Animación de entrada
        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 10);

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-20px)';
            setTimeout(() => messageEl.remove(), 300);
        }, 4000);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Inicializando página de perfil...');
    
    const initProfileManager = () => {
        if (window.apiSystem) {
            window.profileManager = new ProfileManager();
            console.log('✅ ProfileManager inicializado correctamente');
        } else {
            console.log('⏳ Esperando apiSystem...');
            setTimeout(initProfileManager, 100);
        }
    };
    
    initProfileManager();
});
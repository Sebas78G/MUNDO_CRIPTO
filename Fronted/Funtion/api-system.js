// api-system.js - Sistema de comunicación con el backend

class APISystem {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
        console.log('🔧 APISystem inicializado');
    }

    // Helper para hacer requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // Agregar token si existe
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Agregar body si existe
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            console.log(`📡 ${config.method} ${url}`);
            const response = await fetch(url, config);
            const data = await response.json();
            
            console.log(`📥 Respuesta:`, data);
            return data;
        } catch (error) {
            console.error(`❌ Error en request:`, error);
            return { 
                success: false, 
                message: 'Error de conexión con el servidor' 
            };
        }
    }

    // Registro de usuario
    async register(userData) {
        try {
            console.log('👤 Registrando usuario:', userData.email);
            
            const result = await this.request('/register', {
                method: 'POST',
                body: userData
            });

            if (result.success && result.token) {
                this.token = result.token;
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('userData', JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('❌ Error en register:', error);
            return { 
                success: false, 
                message: 'Error al registrar usuario' 
            };
        }
    }

    // Login de usuario
    async login(credentials) {
        try {
            console.log('🔐 Iniciando sesión:', credentials.email);
            
            const result = await this.request('/login', {
                method: 'POST',
                body: credentials
            });

            if (result.success && result.token) {
                this.token = result.token;
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('userData', JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { 
                success: false, 
                message: 'Error al iniciar sesión' 
            };
        }
    }

    // Obtener perfil del usuario
    async getProfile() {
        try {
            console.log('📋 Obteniendo perfil...');
            
            if (!this.token) {
                return { 
                    success: false, 
                    message: 'No hay sesión activa' 
                };
            }

            return await this.request('/profile');
        } catch (error) {
            console.error('❌ Error en getProfile:', error);
            return { 
                success: false, 
                message: 'Error al obtener perfil' 
            };
        }
    }

    isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
    }
    // Obtener usuario actual
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Limpiar sesión
    clearSession() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        console.log('🚪 Sesión limpiada');
    }

    // Validaciones
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password && password.length >= 6;
    }

    validateName(name) {
        return name && name.length >= 2;
    }

    // Guardar transacción de portfolio
    async savePortfolioTransaction(data) {
        try {
            return await this.request('/portfolio/save', {
                method: 'POST',
                body: data
            });
        } catch (error) {
            console.error('❌ Error guardando transacción:', error);
            return { 
                success: false, 
                message: 'Error al guardar transacción' 
            };
        }
    }

    // Obtener historial de portfolio
    async getPortfolioHistory() {
        try {
            return await this.request('/portfolio/history');
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return { 
                success: false, 
                message: 'Error al obtener historial' 
            };
        }
    }

    // Obtener inversiones
    async getPortfolioInvestments() {
        try {
            return await this.request('/portfolio/investments');
        } catch (error) {
            console.error('❌ Error obteniendo inversiones:', error);
            return { 
                success: false, 
                message: 'Error al obtener inversiones' 
            };
        }
    }

    // Health check
    async healthCheck() {
        try {
            return await this.request('/health');
        } catch (error) {
            console.error('❌ Error en health check:', error);
            return { 
                success: false, 
                message: 'Servidor no disponible' 
            };
        }
    }
}

// Hacer disponible globalmente
window.APISystem = APISystem;
console.log('✅ APISystem class definida');
// api-system.js - Sistema de comunicación con la API del backend
class ApiSystem {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
        this.currentUser = JSON.parse(localStorage.getItem('userData') || 'null');
    }

    // Método principal para llamadas a la API
    async call(endpoint, method = 'GET', data = null) { 
        const url = `${this.API_BASE}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Agregar token si existe
        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Agregar datos para POST/PUT
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            console.log(`🌐 API Call: ${method} ${url}`, data);
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error ${response.status}`);
            }
            
            console.log(`✅ API Response:`, result);
            return result;
        } catch (error) {
            console.error(`❌ API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // En api-system.js
async getUserByEmail(email) {
    try {
        const token = this.getToken();
        const response = await fetch(`${this.baseUrl}/user/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: email })
        });
        
        return await response.json();
    } catch (error) {
        return { success: false, message: error.message };
    }
}

     async savePortfolioData(data) {
    try {
        const result = await this.call('/portfolio/save', 'POST', data);
        return result;
    } catch (error) {
        return { 
            success: false, 
            message: error.message 
        };
    }
}

    // Obtener historial del portafolio
  async getPortfolioHistory(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const result = await this.call(`/portfolio/history?${queryString}`, 'GET');
        return result;
    } catch (error) {
        return { 
            success: false, 
            message: error.message 
        };
    }
}

async getPortfolioInvestments() {
    try {
        const result = await this.call('/portfolio/investments', 'GET');
        return result;
    } catch (error) {
        return { 
            success: false, 
            message: error.message 
        };
    }
}

    // ========== AUTH METHODS ==========
    async register(userData) {
        try {
            const result = await this.call('/register', 'POST', userData);
            return result;
        } catch (error) {
            return { 
                success: false, 
                message: error.message || 'Error en el registro' 
            };
        }
    }

    async login(credentials) {
        try {
            const result = await this.call('/login', 'POST', credentials);
            
            if (result.success) {
                this.setSession(result.user, result.token);
            }
            
            return result;
        } catch (error) {
            return { 
                success: false, 
                message: error.message || 'Error en el login' 
            };
        }
    }

    async getProfile() {
    try {
        // Agregar timeout para evitar que se quede colgado
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout
        
        const response = await fetch(`${this.API_BASE}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ getProfile response:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Error en getProfile:', error);
        
        // Si es timeout, devolver un resultado por defecto
        if (error.name === 'AbortError') {
            console.warn('⚠️ Timeout en getProfile, usando datos de localStorage');
            return {
                success: true,
                user: this.currentUser // Usar el usuario que ya tenemos en memoria
            };
        }
        
        return { 
            success: false, 
            message: error.message || 'Error obteniendo perfil' 
        };
    }
}

    async checkHealth() {
        try {
            const result = await this.call('/health', 'GET');
            return result;
        } catch (error) {
            return { 
                success: false, 
                message: 'Servidor no disponible' 
            };
        }
    }

    // ========== SESSION MANAGEMENT ==========
    setSession(user, token) {
        this.currentUser = user;
        this.token = token;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        console.log('🔐 Sesión guardada:', user.name);
    }

    clearSession() {
        this.currentUser = null;
        this.token = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        console.log('🔓 Sesión limpiada');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.token && !!this.currentUser;
    }

    // ========== VALIDATION METHODS ==========
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validateName(name) {
        return name.trim().length >= 2;
    }
}

// Auto-inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🌐 Inicializando ApiSystem...');
        window.apiSystem = new ApiSystem();
    });
} else {
    console.log('🌐 Inicializando ApiSystem (DOM listo)...');
    window.apiSystem = new ApiSystem();
}


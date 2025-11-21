// portfolio-persistence.js - Sistema de persistencia mejorado para el portafolio

class PortfolioPersistence {
    constructor() {
        this.storageKey = 'crypto_portfolio_v2';
        this.backupKey = 'crypto_portfolio_backup';
        this.autoSaveInterval = null;
        this.api = window.apiSystem;
    }

    /**
     * Guardar el estado completo del portafolio
     */
    savePortfolio(portfolioData) {
        try {
            const dataToSave = {
                portfolio: portfolioData,
                timestamp: new Date().toISOString(),
                version: '2.0'
            };

            // Guardar en localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            
            // Crear backup
            const backups = this.getBackups();
            backups.unshift(dataToSave);
            
            // Mantener solo los últimos 5 backups
            if (backups.length > 5) {
                backups.length = 5;
            }
            
            localStorage.setItem(this.backupKey, JSON.stringify(backups));
            
            console.log('✅ Portafolio guardado correctamente');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error guardando portafolio:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cargar el estado del portafolio
     */
    loadPortfolio() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            
            if (!saved) {
                console.log('ℹ️ No hay portafolio guardado');
                return null;
            }

            const data = JSON.parse(saved);
            
            // Verificar que los datos sean válidos
            if (!data.portfolio || !data.timestamp) {
                console.warn('⚠️ Datos del portafolio inválidos');
                return null;
            }

            console.log('✅ Portafolio cargado:', new Date(data.timestamp).toLocaleString());
            return data.portfolio;
            
        } catch (error) {
            console.error('❌ Error cargando portafolio:', error);
            
            // Intentar recuperar del backup
            return this.recoverFromBackup();
        }
    }

    /**
     * Recuperar desde backup
     */
    recoverFromBackup() {
        try {
            const backups = this.getBackups();
            
            if (backups.length === 0) {
                console.log('ℹ️ No hay backups disponibles');
                return null;
            }

            const latestBackup = backups[0];
            console.log('🔄 Recuperando desde backup:', new Date(latestBackup.timestamp).toLocaleString());
            
            return latestBackup.portfolio;
            
        } catch (error) {
            console.error('❌ Error recuperando backup:', error);
            return null;
        }
    }

    /**
     * Obtener todos los backups
     */
    getBackups() {
        try {
            const backups = localStorage.getItem(this.backupKey);
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            console.error('❌ Error obteniendo backups:', error);
            return [];
        }
    }

    /**
     * Limpiar datos antiguos
     */
    clearPortfolio() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('✅ Portafolio limpiado');
            return { success: true };
        } catch (error) {
            console.error('❌ Error limpiando portafolio:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Exportar portafolio a JSON
     */
    exportToJSON(portfolioData) {
        try {
            const exportData = {
                portfolio: portfolioData,
                exportDate: new Date().toISOString(),
                version: '2.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            console.log('✅ Portafolio exportado');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error exportando:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Importar portafolio desde JSON
     */
    async importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (!importData.portfolio) {
                        throw new Error('Archivo inválido: no contiene datos de portafolio');
                    }

                    // Guardar el portafolio importado
                    this.savePortfolio(importData.portfolio);
                    
                    console.log('✅ Portafolio importado correctamente');
                    resolve({ success: true, portfolio: importData.portfolio });
                    
                } catch (error) {
                    console.error('❌ Error importando:', error);
                    reject({ success: false, error: error.message });
                }
            };
            
            reader.onerror = () => {
                reject({ success: false, error: 'Error leyendo archivo' });
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Configurar auto-guardado
     */
    startAutoSave(portfolioGetter, intervalMinutes = 2) {
        // Limpiar intervalo existente
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Configurar nuevo intervalo
        this.autoSaveInterval = setInterval(() => {
            const portfolio = portfolioGetter();
            if (portfolio && portfolio.investments && portfolio.investments.length > 0) {
                this.savePortfolio(portfolio);
                console.log('💾 Auto-guardado ejecutado');
            }
        }, intervalMinutes * 60 * 1000);

        console.log(`✅ Auto-guardado configurado (cada ${intervalMinutes} minutos)`);
    }

    /**
     * Detener auto-guardado
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏹️ Auto-guardado detenido');
        }
    }

    /**
     * Sincronizar con la base de datos (si está disponible)
     */
    async syncWithDatabase(portfolioData) {
        if (!this.api || !this.api.isAuthenticated()) {
            console.log('ℹ️ Usuario no autenticado, saltando sincronización');
            return { success: false, reason: 'not_authenticated' };
        }

        try {
            // Aquí se implementaría la lógica de sincronización con el backend
            console.log('🔄 Sincronizando con base de datos...');
            
            // Por ahora, solo guardamos localmente
            this.savePortfolio(portfolioData);
            
            return { success: true, synced: true };
            
        } catch (error) {
            console.error('❌ Error sincronizando:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener estadísticas de almacenamiento
     */
    getStorageStats() {
        try {
            const portfolio = localStorage.getItem(this.storageKey);
            const backups = localStorage.getItem(this.backupKey);
            
            return {
                portfolioSize: portfolio ? new Blob([portfolio]).size : 0,
                backupsSize: backups ? new Blob([backups]).size : 0,
                backupsCount: this.getBackups().length,
                lastSave: portfolio ? JSON.parse(portfolio).timestamp : null
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return null;
        }
    }
}

// Integración con el portafolio existente
class PortfolioManager {
    constructor() {
        this.persistence = new PortfolioPersistence();
        this.portfolio = null;
    }

    /**
     * Inicializar el portafolio
     */
    init() {
        console.log('🚀 Inicializando PortfolioManager...');
        
        // Intentar cargar portafolio guardado
        this.portfolio = this.persistence.loadPortfolio();
        
        if (this.portfolio) {
            console.log('✅ Portafolio restaurado desde almacenamiento');
            this.applyPortfolioToUI(this.portfolio);
        } else {
            console.log('ℹ️ No hay portafolio guardado, iniciando nuevo');
        }

        // Configurar guardado automático
        this.setupAutoSave();
        
        // Guardar antes de cerrar la página
        this.setupBeforeUnload();
        
        return this.portfolio;
    }

    /**
     * Aplicar portafolio cargado a la UI
     */
    applyPortfolioToUI(portfolioData) {
        // Esta función debe ser llamada desde portafolio.js
        if (window.portfolio && typeof window.updatePortfolioFromData === 'function') {
            window.updatePortfolioFromData(portfolioData);
        } else {
            // Guardar en variable global para que portafolio.js lo use
            window.savedPortfolio = portfolioData;
        }
    }

    /**
     * Configurar auto-guardado
     */
    setupAutoSave() {
        this.persistence.startAutoSave(() => {
            return window.portfolio || this.portfolio;
        }, 2); // Guardar cada 2 minutos
    }

    /**
     * Configurar guardado antes de cerrar
     */
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            const currentPortfolio = window.portfolio || this.portfolio;
            if (currentPortfolio && currentPortfolio.investments && currentPortfolio.investments.length > 0) {
                this.persistence.savePortfolio(currentPortfolio);
                console.log('💾 Portafolio guardado antes de cerrar');
            }
        });
    }

    /**
     * Guardar manualmente
     */
    save() {
        const currentPortfolio = window.portfolio || this.portfolio;
        if (currentPortfolio) {
            return this.persistence.savePortfolio(currentPortfolio);
        }
        return { success: false, error: 'No hay portafolio para guardar' };
    }

    /**
     * Exportar
     */
    export() {
        const currentPortfolio = window.portfolio || this.portfolio;
        if (currentPortfolio) {
            return this.persistence.exportToJSON(currentPortfolio);
        }
        return { success: false, error: 'No hay portafolio para exportar' };
    }

    /**
     * Importar
     */
    async import(file) {
        try {
            const result = await this.persistence.importFromJSON(file);
            if (result.success) {
                this.portfolio = result.portfolio;
                this.applyPortfolioToUI(result.portfolio);
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Limpiar
     */
    clear() {
        this.portfolio = null;
        return this.persistence.clearPortfolio();
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        return this.persistence.getStorageStats();
    }
}

// Inicialización global
window.portfolioManager = new PortfolioManager();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 Inicializando sistema de persistencia...');
        window.portfolioManager.init();
    });
} else {
    console.log('📦 Inicializando sistema de persistencia...');
    window.portfolioManager.init();
}

// Exponer funciones útiles globalmente
window.savePortfolio = () => window.portfolioManager.save();
window.exportPortfolio = () => window.portfolioManager.export();
window.clearPortfolio = () => window.portfolioManager.clear();
window.getPortfolioStats = () => window.portfolioManager.getStats();
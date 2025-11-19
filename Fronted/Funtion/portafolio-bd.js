// portfolio-db.js - VERSIÓN CORREGIDA CON INICIALIZACIÓN ASÍNCRONA

class PortfolioDB {
    constructor() {
        this.api = window.apiSystem;
        this.userId = null;
        this.initialized = false;
        this.pendingTransactions = [];
    }

    async init() {
        if (this.initialized) return;
        
        console.log('💾 Inicializando PortfolioDB...');
        await this.checkUserSession();
        this.initialized = true;
        
        // Procesar transacciones pendientes si las hay
        await this.processPendingTransactions();
    }

    async checkUserSession() {
    console.log('🔍 checkUserSession ejecutándose...');
    
    try {
        if (this.api && typeof this.api.isAuthenticated === 'function' && this.api.isAuthenticated()) {
            console.log('🔍 Usuario autenticado, obteniendo perfil...');
            
            // Intentar obtener perfil con fallback a datos locales
            let userData = null;
            
            try {
                const response = await this.api.getProfile();
                console.log('🔍 Respuesta de getProfile:', response);
                
                if (response.success && response.user) {
                    userData = response.user;
                }
            } catch (profileError) {
                console.warn('⚠️ Error obteniendo perfil, usando datos locales:', profileError);
                // Usar datos del usuario desde localStorage
                const localUser = localStorage.getItem('currentUser');
                if (localUser) {
                    try {
                        userData = JSON.parse(localUser);
                        console.log('🔍 Usando usuario de localStorage:', userData);
                    } catch (e) {
                        console.error('❌ Error parseando usuario de localStorage:', e);
                    }
                }
            }
            
            if (userData && userData.id) {
                this.userId = userData.id;
                console.log('✅ Usuario configurado para PortfolioDB:', this.userId);
            } else {
                console.warn('⚠️ No se pudo obtener userId, usando valor por defecto');
                this.userId = 0; // Valor por defecto
            }
            
        } else {
            console.warn('⚠️ Usuario NO autenticado en apiSystem');
            this.userId = 0; // Valor por defecto para usuarios no autenticados
        }
        
        // MARCAR SIEMPRE COMO INICIALIZADO después de intentar obtener el usuario
        this.initialized = true;
        console.log('✅ PortfolioDB marcado como inicializado. userId:', this.userId);
        
        // Sincronizar datos locales si tenemos userId válido
        if (this.userId && this.userId !== 0) {
            await this.syncLocalData();
        }
        
    } catch (error) {
        console.error('❌ Error crítico en checkUserSession:', error);
        // MARCAR COMO INICIALIZADO INCLUSO CON ERROR
        this.initialized = true;
        this.userId = 0;
    }
}

    // Guardar transacción de compra
    async saveBuyTransaction(transactionData) {
        console.log('🛒 saveBuyTransaction llamado con:', transactionData);
        
        // Si no está inicializado, guardar en pendientes
        if (!this.initialized || !this.userId) {
            console.warn('⏳ PortfolioDB no inicializado, guardando en pendientes...');
            this.pendingTransactions.push({ type: 'buy', data: transactionData });
            return { success: true, pending: true, message: 'Transacción en cola' };
        }
        
        const transaction = {
            type: 'buy',
            user_id: this.userId,
            cryptoSymbol: transactionData.crypto,
            cryptoName: window.cryptoData?.[transactionData.crypto]?.name || 'Unknown',
            amount: parseFloat(transactionData.amount),
            price: parseFloat(window.cryptoData?.[transactionData.crypto]?.price || 0),
            investment: parseFloat(transactionData.value),
            fee: parseFloat(transactionData.fee),
            totalCost: parseFloat(transactionData.value + transactionData.fee),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'completed'
        };

        console.log('💾 Guardando compra en BD:', transaction);
        return await this.saveToDatabase(transaction);
    }

    // Guardar transacción de venta
    async saveSellTransaction(transactionData, investment) {
        console.log('💰 saveSellTransaction llamado con:', transactionData, investment);
        
        // Si no está inicializado, guardar en pendientes
        if (!this.initialized || !this.userId) {
            console.warn('⏳ PortfolioDB no inicializado, guardando en pendientes...');
            this.pendingTransactions.push({ type: 'sell', data: transactionData, investment: investment });
            return { success: true, pending: true, message: 'Transacción en cola' };
        }
        
        const profitPercentage = (transactionData.profit / (transactionData.amount * investment.purchasePrice)) * 100;
        
        const transaction = {
            type: 'sell',
            user_id: this.userId,
            cryptoSymbol: transactionData.crypto,
            cryptoName: window.cryptoData?.[transactionData.crypto]?.name || 'Unknown',
            amount: parseFloat(transactionData.amount),
            price: parseFloat(window.cryptoData?.[transactionData.crypto]?.price || 0),
            purchasePrice: parseFloat(investment.purchasePrice),
            saleValue: parseFloat(transactionData.value),
            profit: parseFloat(transactionData.profit),
            profitPercentage: parseFloat(profitPercentage),
            fee: parseFloat(transactionData.fee),
            netAmount: parseFloat(transactionData.value - transactionData.fee),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'completed'
        };

        console.log('💾 Guardando venta en BD:', transaction);
        return await this.saveToDatabase(transaction);
    }

    // Guardar transacción de retiro
    async saveWithdrawTransaction(transactionData) {
        console.log('🏧 saveWithdrawTransaction llamado con:', transactionData);
        
        // Si no está inicializado, guardar en pendientes
        if (!this.initialized || !this.userId) {
            console.warn('⏳ PortfolioDB no inicializado, guardando en pendientes...');
            this.pendingTransactions.push({ type: 'withdraw', data: transactionData });
            return { success: true, pending: true, message: 'Transacción en cola' };
        }
        
        const transaction = {
            type: 'withdraw',
            user_id: this.userId,
            amount: parseFloat(transactionData.value),
            fee: parseFloat(transactionData.fee),
            netAmount: parseFloat(transactionData.value - transactionData.fee),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'completed'
        };

        console.log('💾 Guardando retiro en BD:', transaction);
        return await this.saveToDatabase(transaction);
    }

    // Procesar transacciones pendientes
    async processPendingTransactions() {
        if (this.pendingTransactions.length === 0) return;
        
        console.log(`🔄 Procesando ${this.pendingTransactions.length} transacciones pendientes...`);
        
        for (const pending of this.pendingTransactions) {
            try {
                let result;
                switch (pending.type) {
                    case 'buy':
                        result = await this.saveBuyTransaction(pending.data);
                        break;
                    case 'sell':
                        result = await this.saveSellTransaction(pending.data, pending.investment);
                        break;
                    case 'withdraw':
                        result = await this.saveWithdrawTransaction(pending.data);
                        break;
                }
                console.log(`✅ Transacción pendiente procesada:`, pending.type, result);
            } catch (error) {
                console.error(`❌ Error procesando transacción pendiente:`, error);
            }
        }
        
        // Limpiar pendientes procesados
        this.pendingTransactions = [];
        console.log('🔄 Procesamiento de pendientes completado');
    }

    // Guardar estado del portafolio
    async savePortfolioSnapshot(portfolio) {
        console.log('📊 savePortfolioSnapshot llamado con:', portfolio);
        
        // Si no está inicializado, no guardar snapshot
        if (!this.initialized || !this.userId) {
            console.warn('⏳ PortfolioDB no inicializado, omitiendo snapshot...');
            return { success: true, skipped: true, message: 'Snapshot omitido' };
        }
        
        const snapshot = {
            type: 'portfolio_snapshot',
            user_id: this.userId,
            totalBalance: parseFloat(portfolio.balance),
            availableBalance: parseFloat(portfolio.availableBalance),
            totalInvested: parseFloat(portfolio.totalInvested),
            totalProfit: parseFloat(portfolio.totalProfit),
            totalProfitPercentage: parseFloat(portfolio.totalProfitPercentage),
            snapshot_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            investments: portfolio.investments.map(inv => ({
                cryptoSymbol: inv.crypto,
                cryptoName: window.cryptoData?.[inv.crypto]?.name || 'Unknown',
                amount: parseFloat(inv.amount),
                purchasePrice: parseFloat(inv.purchasePrice),
                currentPrice: parseFloat(inv.currentPrice),
                currentValue: parseFloat(inv.currentValue),
                profit: parseFloat(inv.profit),
                profitPercentage: parseFloat(inv.profitPercentage),
                investmentValue: parseFloat(inv.investmentValue)
            }))
        };

        console.log('💾 Guardando snapshot en BD:', snapshot);
        return await this.saveToDatabase(snapshot);
    }

    // Método principal para guardar en la base de datos
    async saveToDatabase(data) {
        console.log('💾 saveToDatabase ejecutándose con:', data);
        
        try {
            // Si no hay usuario autenticado, guardar localmente
            if (!this.userId) {
                console.warn('⚠️ No hay userId, guardando localmente');
                this.saveToLocalStorage(data);
                return { success: true, local: true, message: 'Guardado localmente' };
            }

            console.log('🔍 userId disponible:', this.userId);
            console.log('🔍 Llamando a api.savePortfolioData...');

            // Si hay usuario autenticado, guardar en la base de datos real
            const response = await this.api.savePortfolioData(data);
            console.log('🔍 Respuesta de savePortfolioData:', response);
            
            if (response.success) {
                console.log('✅ Datos guardados en la base de datos:', data.type);
                return { success: true, local: false, data: response.data };
            } else {
                console.warn('⚠️ Error guardando en BD, guardando localmente:', response.message);
                this.saveToLocalStorage(data);
                return { success: true, local: true, error: response.message };
            }
        } catch (error) {
            console.error('❌ Error en saveToDatabase:', error);
            this.saveToLocalStorage(data);
            return { success: true, local: true, error: error.message };
        }
    }

    // Guardar localmente en localStorage como respaldo
    saveToLocalStorage(data) {
        try {
            console.log('💾 Guardando en localStorage:', data.type);
            
            const key = `portfolio_${data.type}_${Date.now()}`;
            const existingData = JSON.parse(localStorage.getItem('portfolio_backup') || '[]');
            existingData.push({
                key: key,
                data: data,
                timestamp: new Date().toISOString(),
                synced: false
            });
            
            // Mantener solo los últimos 100 registros
            if (existingData.length > 100) {
                existingData.splice(0, existingData.length - 100);
            }
            
            localStorage.setItem('portfolio_backup', JSON.stringify(existingData));
            console.log('✅ Datos guardados localmente:', data.type);
            
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
    }

    // Sincronizar datos locales con la base de datos cuando el usuario se autentique
    async syncLocalData() {
        console.log('🔄 syncLocalData ejecutándose...');
        
        if (!this.userId) {
            console.warn('⚠️ No hay userId para sincronizar');
            return;
        }

        try {
            const localData = JSON.parse(localStorage.getItem('portfolio_backup') || '[]');
            const unsyncedData = localData.filter(item => !item.synced);

            console.log(`🔄 Sincronizando ${unsyncedData.length} registros locales...`);

            for (const item of unsyncedData) {
                console.log('🔄 Sincronizando registro:', item.data.type);
                // Actualizar el user_id en los datos locales antes de sincronizar
                item.data.user_id = this.userId;
                const result = await this.saveToDatabase(item.data);
                if (result.success && !result.local) {
                    item.synced = true;
                    console.log('✅ Registro sincronizado:', item.data.type);
                } else {
                    console.warn('⚠️ No se pudo sincronizar:', item.data.type);
                }
            }

            localStorage.setItem('portfolio_backup', JSON.stringify(localData));
            console.log('🔄 Sincronización completada');
        } catch (error) {
            console.error('❌ Error sincronizando datos locales:', error);
        }
    }

    // Obtener historial de transacciones del usuario
    async getTransactionHistory(limit = 50) {
        console.log('📜 getTransactionHistory llamado');
        
        if (!this.userId) {
            console.warn('⚠️ No hay userId, usando historial local');
            return this.getLocalTransactionHistory(limit);
        }

        try {
            const response = await this.api.getPortfolioHistory({ limit });
            console.log('🔍 Respuesta de getPortfolioHistory:', response);
            
            if (response.success) {
                return response.data;
            } else {
                console.warn('⚠️ Error obteniendo historial de BD, usando local:', response.message);
                return this.getLocalTransactionHistory(limit);
            }
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return this.getLocalTransactionHistory(limit);
        }
    }

    // Obtener historial local
    getLocalTransactionHistory(limit = 50) {
        try {
            const localData = JSON.parse(localStorage.getItem('portfolio_backup') || '[]');
            const history = localData
                .filter(item => item.data.type !== 'portfolio_snapshot')
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit)
                .map(item => item.data);
            
            console.log('📜 Historial local encontrado:', history.length, 'registros');
            return history;
        } catch (error) {
            console.error('❌ Error obteniendo historial local:', error);
            return [];
        }
    }

    // Método para verificar estado
    getStatus() {
        return {
            initialized: this.initialized,
            userId: this.userId,
            pendingTransactions: this.pendingTransactions.length,
            apiAvailable: !!this.api
        };
    }
}

// Inicialización automática MEJORADA
// Inicialización automática MEJORADA - AL FINAL de portfolio-db.js
let portfolioDB;
let portfolioDBReady = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('💾 DOMContentLoaded - Inicializando PortfolioDB...');
    
    const initPortfolioDB = async () => {
        console.log('🔍 initPortfolioDB ejecutándose...');
        
        if (window.apiSystem) {
            console.log('✅ apiSystem disponible, creando PortfolioDB...');
            portfolioDB = new PortfolioDB();
            window.portfolioDB = portfolioDB;
            
            // Inicializar de forma asíncrona
            await portfolioDB.init();
            portfolioDBReady = true;
            console.log('✅ PortfolioDB completamente inicializado');
            console.log('📊 Estado final:', portfolioDB.getStatus());
            
            // Disparar evento personalizado para notificar que está listo
            window.dispatchEvent(new CustomEvent('portfolioDBReady', {
                detail: { portfolioDB: portfolioDB }
            }));
        } else {
            console.log('⏳ Esperando apiSystem...');
            setTimeout(initPortfolioDB, 200);
        }
    };
    
    // Iniciar después de que todo esté cargado
    setTimeout(initPortfolioDB, 100);
});

// Función global para verificar si PortfolioDB está listo
window.waitForPortfolioDB = function() {
    return new Promise((resolve) => {
        if (portfolioDBReady && portfolioDB && portfolioDB.initialized) {
            resolve(portfolioDB);
        } else {
            const listener = () => {
                resolve(portfolioDB);
                window.removeEventListener('portfolioDBReady', listener);
            };
            window.addEventListener('portfolioDBReady', listener);
        }
    });
};
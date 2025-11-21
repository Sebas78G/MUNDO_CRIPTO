// portfolio-integration.js - Integración de persistencia con portafolio existente
// Este archivo debe cargarse DESPUÉS de portafolio.js

(function() {
    'use strict';

    console.log('🔗 Inicializando integración de persistencia...');

    // Esperar a que todo esté cargado
    const initIntegration = () => {
        // Verificar que las dependencias estén disponibles
        if (typeof portfolio === 'undefined') {
            console.warn('⚠️ Variable portfolio no encontrada, reintentando...');
            setTimeout(initIntegration, 500);
            return;
        }

        if (typeof window.portfolioManager === 'undefined') {
            console.warn('⚠️ portfolioManager no encontrado, reintentando...');
            setTimeout(initIntegration, 500);
            return;
        }

        console.log('✅ Dependencias encontradas, integrando persistencia...');
        setupPersistenceIntegration();
    };

    function setupPersistenceIntegration() {
        // 1. Intentar restaurar portafolio guardado
        restorePortfolio();

        // 2. Interceptar funciones de actualización para auto-guardar
        interceptPortfolioUpdates();

        // 3. Agregar botones de importación/exportación
        addPersistenceUI();

        // 4. Configurar eventos de guardado
        setupSaveEvents();

        console.log('✅ Integración de persistencia completada');
    }

    function restorePortfolio() {
        try {
            const savedPortfolio = window.portfolioManager.persistence.loadPortfolio();
            
            if (!savedPortfolio) {
                console.log('ℹ️ No hay portafolio guardado para restaurar');
                return;
            }

            // Solo restaurar si el portafolio actual está vacío
            if (portfolio.investments.length === 0) {
                console.log('🔄 Restaurando portafolio guardado...');
                
                // Copiar datos del portafolio guardado
                portfolio.balance = savedPortfolio.balance || 0;
                portfolio.availableBalance = savedPortfolio.availableBalance || 0;
                portfolio.totalInvested = savedPortfolio.totalInvested || 0;
                portfolio.totalProfit = savedPortfolio.totalProfit || 0;
                portfolio.totalProfitPercentage = savedPortfolio.totalProfitPercentage || 0;
                
                // Restaurar inversiones
                if (savedPortfolio.investments && Array.isArray(savedPortfolio.investments)) {
                    portfolio.investments = savedPortfolio.investments.map(inv => ({
                        ...inv,
                        // Asegurar que todos los campos necesarios existan
                        id: inv.id || Date.now() + Math.random(),
                        crypto: inv.crypto || 'BTC',
                        amount: parseFloat(inv.amount) || 0,
                        purchasePrice: parseFloat(inv.purchasePrice) || 0,
                        currentPrice: parseFloat(inv.currentPrice) || 0,
                        investmentValue: parseFloat(inv.investmentValue) || 0,
                        currentValue: parseFloat(inv.currentValue) || 0,
                        profit: parseFloat(inv.profit) || 0,
                        profitPercentage: parseFloat(inv.profitPercentage) || 0
                    }));
                }

                // Actualizar UI
                if (typeof updatePortfolioDisplay === 'function') {
                    updatePortfolioDisplay();
                }

                showNotification('✅ Portafolio restaurado correctamente', 'success');
                console.log('✅ Portafolio restaurado:', portfolio);
            }
        } catch (error) {
            console.error('❌ Error restaurando portafolio:', error);
            showNotification('⚠️ Error al restaurar portafolio', 'warning');
        }
    }

    function interceptPortfolioUpdates() {
        // Guardar después de cada compra
        const originalHandleBuy = window.handleBuy;
        if (typeof originalHandleBuy === 'function') {
            window.handleBuy = async function() {
                const result = await originalHandleBuy.apply(this, arguments);
                window.portfolioManager.save();
                return result;
            };
            console.log('✅ handleBuy interceptado para auto-guardado');
        }

        // Guardar después de cada venta
        const originalHandleSell = window.handleSell;
        if (typeof originalHandleSell === 'function') {
            window.handleSell = async function() {
                const result = await originalHandleSell.apply(this, arguments);
                window.portfolioManager.save();
                return result;
            };
            console.log('✅ handleSell interceptado para auto-guardado');
        }

        // Guardar después de cada retiro
        const originalHandleWithdraw = window.handleWithdraw;
        if (typeof originalHandleWithdraw === 'function') {
            window.handleWithdraw = async function() {
                const result = await originalHandleWithdraw.apply(this, arguments);
                window.portfolioManager.save();
                return result;
            };
            console.log('✅ handleWithdraw interceptado para auto-guardado');
        }
    }

    function addPersistenceUI() {
        // Buscar el contenedor del dashboard
        const dashboardElement = document.querySelector('.dashboard');
        if (!dashboardElement) {
            console.log('ℹ️ No se encontró elemento dashboard para agregar UI');
            return;
        }

        // Crear contenedor de botones
        const persistenceContainer = document.createElement('div');
        persistenceContainer.className = 'persistence-controls';
        persistenceContainer.innerHTML = `
            <style>
                .persistence-controls {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--card-background, #1e293b);
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                .persistence-controls h3 {
                    width: 100%;
                    margin: 0 0 0.5rem 0;
                    color: var(--text-primary, #e2e8f0);
                }
                .persistence-btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }
                .persistence-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                .btn-save {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }
                .btn-export {
                    background: linear-gradient(135deg, #f093fb, #f5576c);
                    color: white;
                }
                .btn-import {
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    color: white;
                }
                .btn-clear {
                    background: linear-gradient(135deg, #fa709a, #fee140);
                    color: white;
                }
                .file-input-wrapper {
                    position: relative;
                    display: inline-block;
                }
                .file-input-wrapper input[type=file] {
                    position: absolute;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }
            </style>
            <h3>💾 Gestión de Portafolio</h3>
            <button id="savePortfolioBtn" class="persistence-btn btn-save">
                <i class="fas fa-save"></i> Guardar Ahora
            </button>
            <button id="exportPortfolioBtn" class="persistence-btn btn-export">
                <i class="fas fa-download"></i> Exportar
            </button>
            <div class="file-input-wrapper">
                <button class="persistence-btn btn-import">
                    <i class="fas fa-upload"></i> Importar
                </button>
                <input type="file" id="importPortfolioInput" accept=".json">
            </div>
            <button id="clearPortfolioBtn" class="persistence-btn btn-clear">
                <i class="fas fa-trash"></i> Limpiar
            </button>
        `;

        // Insertar al inicio del dashboard
        dashboardElement.insertBefore(persistenceContainer, dashboardElement.firstChild);

        // Configurar event listeners
        setupPersistenceButtons();
        console.log('✅ UI de persistencia agregada');
    }

    function setupPersistenceButtons() {
        // Botón guardar
        const saveBtn = document.getElementById('savePortfolioBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const result = window.portfolioManager.save();
                if (result.success) {
                    showNotification('✅ Portafolio guardado correctamente', 'success');
                } else {
                    showNotification('❌ Error al guardar portafolio', 'error');
                }
            });
        }

        // Botón exportar
        const exportBtn = document.getElementById('exportPortfolioBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const result = window.portfolioManager.export();
                if (result.success) {
                    showNotification('✅ Portafolio exportado correctamente', 'success');
                } else {
                    showNotification('❌ Error al exportar portafolio', 'error');
                }
            });
        }

        // Botón importar
        const importInput = document.getElementById('importPortfolioInput');
        if (importInput) {
            importInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const result = await window.portfolioManager.import(file);
                    if (result.success) {
                        showNotification('✅ Portafolio importado correctamente', 'success');
                        
                        // Recargar la página para aplicar cambios
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showNotification('❌ Error al importar: ' + result.error, 'error');
                    }
                } catch (error) {
                    showNotification('❌ Error al importar portafolio', 'error');
                }

                // Limpiar input
                e.target.value = '';
            });
        }

        // Botón limpiar
        const clearBtn = document.getElementById('clearPortfolioBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const confirmed = confirm('⚠️ ¿Estás seguro de que quieres limpiar todo el portafolio? Esta acción no se puede deshacer.');
                
                if (confirmed) {
                    const result = window.portfolioManager.clear();
                    if (result.success) {
                        showNotification('✅ Portafolio limpiado correctamente', 'success');
                        
                        // Recargar la página
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showNotification('❌ Error al limpiar portafolio', 'error');
                    }
                }
            });
        }
    }

    function setupSaveEvents() {
        // Guardar periódicamente (cada 30 segundos si hay cambios)
        let lastSaveTime = Date.now();
        setInterval(() => {
            if (portfolio.investments.length > 0 && Date.now() - lastSaveTime > 30000) {
                window.portfolioManager.save();
                lastSaveTime = Date.now();
                console.log('💾 Auto-guardado periódico ejecutado');
            }
        }, 30000);

        // Guardar al cambiar de pestaña o minimizar
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && portfolio.investments.length > 0) {
                window.portfolioManager.save();
                console.log('💾 Guardado al ocultar pestaña');
            }
        });

        console.log('✅ Eventos de guardado configurados');
    }

    function showNotification(message, type = 'info') {
        // Reutilizar la función existente o crear una nueva
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }

        // Crear notificación simple
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Función global para actualizar portafolio desde datos
    window.updatePortfolioFromData = function(portfolioData) {
        if (!portfolioData) return;

        portfolio.balance = portfolioData.balance || 0;
        portfolio.availableBalance = portfolioData.availableBalance || 0;
        portfolio.totalInvested = portfolioData.totalInvested || 0;
        portfolio.totalProfit = portfolioData.totalProfit || 0;
        portfolio.totalProfitPercentage = portfolioData.totalProfitPercentage || 0;
        portfolio.investments = portfolioData.investments || [];

        if (typeof updatePortfolioDisplay === 'function') {
            updatePortfolioDisplay();
        }

        console.log('✅ Portafolio actualizado desde datos');
    };

    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Iniciar integración
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIntegration);
    } else {
        initIntegration();
    }

    console.log('✅ Script de integración de persistencia cargado');

})();
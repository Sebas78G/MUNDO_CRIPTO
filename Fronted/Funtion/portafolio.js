// =============================================
// PORTAFOLIO.JS - VERSIÓN CORREGIDA
// =============================================

// Datos de criptomonedas
let cryptoData = {
    bitcoin: { name: "Bitcoin", symbol: "BTC", price: 45000, change: 0, icon: "₿" },
    ethereum: { name: "Ethereum", symbol: "ETH", price: 3000, change: 0, icon: "Ξ" },
    cardano: { name: "Cardano", symbol: "ADA", price: 1.2, change: 0, icon: "A" },
    solana: { name: "Solana", symbol: "SOL", price: 100, change: 0, icon: "S" },
    dogecoin: { name: "Dogecoin", symbol: "DOGE", price: 0.15, change: 0, icon: "Ð" },
    ripple: { name: "Ripple", symbol: "XRP", price: 0.75, change: 0, icon: "X" },
    polkadot: { name: "Polkadot", symbol: "DOT", price: 8.5, change: 0, icon: "●" },
    litecoin: { name: "Litecoin", symbol: "LTC", price: 75, change: 0, icon: "Ł" },
    chainlink: { name: "Chainlink", symbol: "LINK", price: 18, change: 0, icon: "◘" },
    stellar: { name: "Stellar", symbol: "XLM", price: 0.35, change: 0, icon: "*" }
};

// Configuración de comisiones
const tradingFee = 0.0025; // 0.25%
const withdrawalFee = 0.015; // 1.5%
const minWithdrawalFee = 5; // $5 mínimo

// Estado del portafolio
let portfolio = {
    balance: 0,
    availableBalance: 0,
    investments: [],
    totalProfit: 0,
    totalProfitPercentage: 0,
    totalInvested: 0
};

let transactionHistory = [];
let portfolioLoaded = false;

// =============================================
// FUNCIONES DE USUARIO Y STORAGE
// =============================================

function getCurrentUserId() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            const user = JSON.parse(userData);
            return user.id || user.email || 'guest';
        }
    } catch (error) {
        console.error('❌ Error obteniendo userId:', error);
    }
    return 'guest';
}

function getPortfolioStorageKey() {
    const userId = getCurrentUserId();
    return `crypto_portfolio_${userId}`;
}

function savePortfolioState() {
    try {
        const portfolioState = {
            userId: getCurrentUserId(),
            balance: portfolio.balance,
            availableBalance: portfolio.availableBalance,
            investments: portfolio.investments,
            totalProfit: portfolio.totalProfit,
            totalProfitPercentage: portfolio.totalProfitPercentage,
            totalInvested: portfolio.totalInvested,
            transactionHistory: transactionHistory,
            timestamp: new Date().toISOString()
        };
        
        const storageKey = getPortfolioStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(portfolioState));
        console.log(`💾 Portafolio guardado para usuario: ${getCurrentUserId()}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error guardando portafolio:', error);
        return false;
    }
}

function loadPortfolioState() {
    try {
        const storageKey = getPortfolioStorageKey();
        const savedState = localStorage.getItem(storageKey);
        
        if (!savedState) {
            console.log(`ℹ️ No hay portafolio guardado para usuario: ${getCurrentUserId()}`);
            return false;
        }
        
        const portfolioState = JSON.parse(savedState);
        
        // Verificar que el portafolio sea del usuario correcto
        if (portfolioState.userId !== getCurrentUserId()) {
            console.warn('⚠️ Portafolio de otro usuario, ignorando...');
            return false;
        }
        
        // Restaurar el estado
        portfolio.balance = portfolioState.balance || 0;
        portfolio.availableBalance = portfolioState.availableBalance || 0;
        portfolio.totalInvested = portfolioState.totalInvested || 0;
        portfolio.totalProfit = portfolioState.totalProfit || 0;
        portfolio.totalProfitPercentage = portfolioState.totalProfitPercentage || 0;
        
        // Restaurar inversiones
        if (Array.isArray(portfolioState.investments)) {
            portfolio.investments = portfolioState.investments;
        }
        
        // Restaurar historial
        if (Array.isArray(portfolioState.transactionHistory)) {
            transactionHistory = portfolioState.transactionHistory.map(tx => ({
                ...tx,
                timestamp: new Date(tx.timestamp)
            }));
        }
        
        console.log(`✅ Portafolio restaurado para usuario: ${getCurrentUserId()}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error cargando portafolio:', error);
        return false;
    }
}

function clearCurrentUserPortfolio() {
    try {
        const storageKey = getPortfolioStorageKey();
        localStorage.removeItem(storageKey);
        console.log(`🧹 Portafolio limpiado para usuario: ${getCurrentUserId()}`);
        return true;
    } catch (error) {
        console.error('❌ Error limpiando portafolio:', error);
        return false;
    }
}

// =============================================
// EVENTOS DE USUARIO
// =============================================

window.addEventListener('userLoggedIn', function(event) {
    console.log('👤 Usuario cambió, recargando portafolio...');
    
    // Limpiar portafolio actual en memoria
    portfolio = {
        balance: 0,
        availableBalance: 0,
        investments: [],
        totalProfit: 0,
        totalProfitPercentage: 0,
        totalInvested: 0
    };
    transactionHistory = [];
    
    // Intentar cargar portafolio del nuevo usuario
    const loaded = loadPortfolioState();
    
    if (loaded && portfolio.balance > 0) {
        updatePortfolioDisplay();
        updateTransactionHistory();
        if (setupModal) setupModal.style.display = 'none';
    } else {
        if (setupModal) setupModal.style.display = 'flex';
    }
});

window.addEventListener('userLoggedOut', function() {
    console.log('👤 Usuario cerró sesión, limpiando portafolio...');
    
    portfolio = {
        balance: 0,
        availableBalance: 0,
        investments: [],
        totalProfit: 0,
        totalProfitPercentage: 0,
        totalInvested: 0
    };
    transactionHistory = [];
    
    updatePortfolioDisplay();
    updateTransactionHistory();
});

// =============================================
// ELEMENTOS DEL DOM
// =============================================

let totalBalanceElement, availableBalanceElement, investedAmountElement;
let totalProfitElement, profitPercentageElement, marketPricesElement;
let portfolioListElement, emptyPortfolioElement, cryptoSelectElement;
let investmentAmountElement, cryptoAmountElement, buyButtonElement;
let transactionHistoryElement, amountButtons, setupModal;
let initialBalanceInput, startTradingButton, balancePresets;
let refreshPricesButton, sellModalBtn, sellModal, closeSellModal;
let sellCryptoSelect, sellPercentage, sellPercentageValue;
let sellCurrentValue, sellProfit, confirmSellButton;
let withdrawAmountElement, withdrawButton;

function initializeElements() {
    totalBalanceElement = document.getElementById('total-balance');
    availableBalanceElement = document.getElementById('available-balance');
    investedAmountElement = document.getElementById('invested-amount');
    totalProfitElement = document.getElementById('total-profit');
    profitPercentageElement = document.getElementById('profit-percentage');
    marketPricesElement = document.getElementById('market-prices');
    portfolioListElement = document.getElementById('portfolio-list');
    emptyPortfolioElement = document.getElementById('empty-portfolio');
    cryptoSelectElement = document.getElementById('crypto-select');
    investmentAmountElement = document.getElementById('investment-amount');
    cryptoAmountElement = document.getElementById('crypto-amount');
    buyButtonElement = document.getElementById('buy-button');
    transactionHistoryElement = document.getElementById('transaction-history');
    amountButtons = document.querySelectorAll('.amount-buttons button');
    setupModal = document.getElementById('setup-modal');
    initialBalanceInput = document.getElementById('initial-balance');
    startTradingButton = document.getElementById('start-trading');
    balancePresets = document.querySelectorAll('.balance-presets button');
    refreshPricesButton = document.getElementById('refresh-prices');
    sellModalBtn = document.getElementById('sell-modal-btn');
    sellModal = document.getElementById('sell-modal');
    closeSellModal = document.getElementById('close-sell-modal');
    sellCryptoSelect = document.getElementById('sell-crypto-select');
    sellPercentage = document.getElementById('sell-percentage');
    sellPercentageValue = document.getElementById('sell-percentage-value');
    sellCurrentValue = document.getElementById('sell-current-value');
    sellProfit = document.getElementById('sell-profit');
    confirmSellButton = document.getElementById('confirm-sell');
    withdrawAmountElement = document.getElementById('withdraw-amount');
    withdrawButton = document.getElementById('withdraw-button');
}

// =============================================
// INICIALIZACIÓN
// =============================================

function init() {
    console.log('🚀 Inicializando portafolio...');
    
    // Verificar que hay usuario logueado
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        console.warn('⚠️ No hay usuario logueado, usando modo invitado');
        // NO redirigir, permitir modo invitado
        // alert('⚠️ Debes iniciar sesión para usar el portafolio');
        // window.location.href = '/Fronted/index.html';
        // return;
    }
    
    initializeElements();
    
    const portfolioRestored = loadPortfolioState();
    
    if (portfolioRestored && portfolio.balance > 0) {
        console.log('✅ Portafolio restaurado desde storage');
        portfolioLoaded = true;
        
        if (setupModal) setupModal.style.display = 'none';
        
        updatePortfolioDisplay();
        updateTransactionHistory();
        updateMarketPrices();
        
    } else {
        console.log('ℹ️ No hay portafolio guardado, mostrando configuración');
        if (setupModal) setupModal.style.display = 'flex';
    }
    
    populateCryptoSelect();
    setupEventListeners();
    
    if (initialBalanceInput) {
        initialBalanceInput.addEventListener('input', validateInitialBalance);
    }
    
    setInterval(updateMarketPrices, 5000);
    
    validateInitialBalance();
    
    setInterval(() => {
        if (portfolio.balance > 0) {
            savePortfolioState();
        }
    }, 30000);
    
    window.addEventListener('beforeunload', () => {
        if (portfolio.balance > 0) {
            savePortfolioState();
        }
    });
    
    console.log('✅ Portafolio inicializado');
}

// =============================================
// EVENT LISTENERS
// =============================================

function setupEventListeners() {
    if (buyButtonElement) {
        buyButtonElement.addEventListener('click', handleBuy);
    }
    
    if (investmentAmountElement) {
        investmentAmountElement.addEventListener('input', updateCryptoAmount);
    }
    
    if (cryptoSelectElement) {
        cryptoSelectElement.addEventListener('change', updateCryptoAmount);
    }
    
    amountButtons.forEach(button => {
        button.addEventListener('click', () => {
            const percent = parseFloat(button.getAttribute('data-percent'));
            const amount = (portfolio.availableBalance * percent / 100).toFixed(2);
            if (investmentAmountElement) {
                investmentAmountElement.value = amount;
                updateCryptoAmount();
            }
        });
    });
    
    if (startTradingButton) {
        startTradingButton.addEventListener('click', startTrading);
    }
    
    if (balancePresets) {
        balancePresets.forEach(button => {
            button.addEventListener('click', () => {
                const amount = button.getAttribute('data-amount');
                if (initialBalanceInput) {
                    initialBalanceInput.value = amount;
                    validateInitialBalance();
                }
            });
        });
    }
    
    if (refreshPricesButton) {
        refreshPricesButton.addEventListener('click', updateMarketPrices);
    }
    
    if (sellModalBtn) {
        sellModalBtn.addEventListener('click', openSellModal);
    }
    
    if (closeSellModal) {
        closeSellModal.addEventListener('click', closeSellModalFunc);
    }
    
    if (sellPercentage) {
        sellPercentage.addEventListener('input', updateSellModal);
    }
    
    if (confirmSellButton) {
        confirmSellButton.addEventListener('click', handleSell);
    }
    
    if (withdrawButton) {
        withdrawButton.addEventListener('click', handleWithdraw);
    }
}

// =============================================
// FUNCIONES DE TRADING (continuaría...)
// =============================================

function populateCryptoSelect() {
    if (!cryptoSelectElement) return;
    
    cryptoSelectElement.innerHTML = '';
    
    for (const crypto in cryptoData) {
        const option = document.createElement('option');
        option.value = crypto;
        option.textContent = `${cryptoData[crypto].name} (${cryptoData[crypto].symbol})`;
        cryptoSelectElement.appendChild(option);
    }
}

function validateInitialBalance() {
    if (!initialBalanceInput || !startTradingButton) return;
    
    const initialBalance = parseFloat(initialBalanceInput.value);
    
    if (isNaN(initialBalance) || initialBalance < 100 || initialBalance > 1000000) {
        startTradingButton.disabled = true;
        initialBalanceInput.style.borderColor = '#ef4444';
    } else {
        startTradingButton.disabled = false;
        initialBalanceInput.style.borderColor = '#10b981';
    }
}

function startTrading() {
    const initialBalance = parseFloat(initialBalanceInput.value);
    
    if (isNaN(initialBalance) || initialBalance < 100) {
        alert('El capital inicial debe ser de al menos $100');
        return;
    }
    
    if (initialBalance > 1000000) {
        alert('El capital inicial no puede exceder $1,000,000');
        return;
    }
    
    portfolio.balance = initialBalance;
    portfolio.availableBalance = initialBalance;
    portfolioLoaded = true;
    
    savePortfolioState();
    
    if (setupModal) setupModal.style.display = 'none';
    
    updateMarketPrices();
    updatePortfolioDisplay();
    updateTransactionHistory();
    updateCryptoAmount();
    
    setTimeout(() => {
        alert(`¡Bienvenido! Tu capital inicial de $${initialBalance.toLocaleString()} ha sido configurado.`);
    }, 500);
}

function updateMarketPrices() {
    for (const crypto in cryptoData) {
        const changePercent = (Math.random() * 10 - 5) / 100;
        cryptoData[crypto].change = changePercent * 100;
        cryptoData[crypto].price *= (1 + changePercent);
        
        if (cryptoData[crypto].price < 0.01) {
            cryptoData[crypto].price = 0.01;
        }
    }
    
    if (!marketPricesElement) return;
    
    marketPricesElement.innerHTML = '';
    
    for (const crypto in cryptoData) {
        const priceElement = document.createElement('div');
        priceElement.className = 'crypto-price';
        
        const changeClass = cryptoData[crypto].change >= 0 ? 'profit' : 'loss';
        const changeSymbol = cryptoData[crypto].change >= 0 ? '+' : '';
        
        priceElement.innerHTML = `
            <div class="crypto-name">
                <span class="crypto-icon">${cryptoData[crypto].icon}</span>
                ${cryptoData[crypto].name} (${cryptoData[crypto].symbol})
            </div>
            <div class="crypto-value">
                $${cryptoData[crypto].price.toFixed(2)}
                <div class="crypto-change ${changeClass}">
                    ${changeSymbol}${cryptoData[crypto].change.toFixed(2)}%
                </div>
            </div>
        `;
        
        marketPricesElement.appendChild(priceElement);
    }
    
    updatePortfolioValues();
}

function updateCryptoAmount() {
    if (!cryptoSelectElement || !investmentAmountElement || !cryptoAmountElement) return;
    
    const selectedCrypto = cryptoSelectElement.value;
    const investmentAmount = parseFloat(investmentAmountElement.value) || 0;
    const cryptoPrice = cryptoData[selectedCrypto].price;
    
    if (investmentAmount > 0 && cryptoPrice > 0) {
        const cryptoAmount = investmentAmount / cryptoPrice;
        cryptoAmountElement.value = cryptoAmount.toFixed(6);
    } else {
        cryptoAmountElement.value = '0';
    }
    
    if (investmentAmount > portfolio.availableBalance) {
        buyButtonElement.disabled = true;
        investmentAmountElement.style.borderColor = '#ef4444';
    } else {
        buyButtonElement.disabled = false;
        investmentAmountElement.style.borderColor = '';
    }
}

async function handleBuy() {
    const selectedCrypto = cryptoSelectElement.value;
    const investmentAmount = parseFloat(investmentAmountElement.value);
    
    if (investmentAmount <= 0) {
        alert('Por favor, ingresa un monto válido');
        return;
    }
    
    if (investmentAmount > portfolio.availableBalance) {
        alert('Fondos insuficientes');
        return;
    }
    
    if (investmentAmount < 10) {
        alert('El monto mínimo de inversión es $10');
        return;
    }
    
    const cryptoPrice = cryptoData[selectedCrypto].price;
    const cryptoAmount = investmentAmount / cryptoPrice;
    const tradingFeeAmount = investmentAmount * tradingFee;
    const totalCost = investmentAmount + tradingFeeAmount;
    
    if (totalCost > portfolio.availableBalance) {
        alert(`Fondos insuficientes. Incluyendo comisión de $${tradingFeeAmount.toFixed(2)}, necesitas $${totalCost.toFixed(2)}`);
        return;
    }
    
    const newInvestment = {
        id: Date.now(),
        crypto: selectedCrypto,
        amount: cryptoAmount,
        purchasePrice: cryptoPrice,
        currentPrice: cryptoPrice,
        investmentValue: investmentAmount,
        currentValue: investmentAmount,
        profit: 0,
        profitPercentage: 0
    };
    
    portfolio.investments.push(newInvestment);
    portfolio.availableBalance -= totalCost;
    portfolio.totalInvested += investmentAmount;
    
    const transaction = {
        type: 'buy',
        crypto: selectedCrypto,
        amount: cryptoAmount,
        value: investmentAmount,
        fee: tradingFeeAmount,
        timestamp: new Date()
    };
    transactionHistory.unshift(transaction);
    
    savePortfolioState();
    
    updatePortfolioDisplay();
    updateTransactionHistory();
    closeSellModalFunc();
    
    const profitSymbol = profit >= 0 ? '+' : '';
    alert(`¡Has vendido ${sellAmount.toFixed(6)} ${cryptoData[investment.crypto].symbol} por ${currentValue.toFixed(2)}! Comisión: ${tradingFeeAmount.toFixed(2)}. Ganancia/Pérdida: ${profitSymbol}${Math.abs(profit).toFixed(2)}`);
}

async function handleWithdraw() {
    const withdrawAmount = parseFloat(withdrawAmountElement.value);
    
    if (withdrawAmount <= 0) {
        alert('Por favor, ingresa un monto válido');
        return;
    }
    
    if (withdrawAmount > portfolio.availableBalance) {
        alert('Fondos insuficientes para realizar el retiro');
        return;
    }
    
    if (withdrawAmount < 10) {
        alert('El monto mínimo de retiro es $10');
        return;
    }
    
    let withdrawalFeeAmount = withdrawAmount * withdrawalFee;
    if (withdrawalFeeAmount < minWithdrawalFee) {
        withdrawalFeeAmount = minWithdrawalFee;
    }
    
    const netAmount = withdrawAmount - withdrawalFeeAmount;
    
    if (netAmount <= 0) {
        alert('El monto de retiro es insuficiente para cubrir la comisión');
        return;
    }
    
    const confirmWithdraw = confirm(
        `¿Estás seguro de que quieres retirar ${withdrawAmount.toFixed(2)}?\n` +
        `Comisión de retiro: ${withdrawalFeeAmount.toFixed(2)}\n` +
        `Recibirás: ${netAmount.toFixed(2)}`
    );
    
    if (!confirmWithdraw) return;
    
    portfolio.availableBalance -= withdrawAmount;
    portfolio.balance -= withdrawAmount;
    
    const transaction = {
        type: 'withdraw',
        value: withdrawAmount,
        fee: withdrawalFeeAmount,
        timestamp: new Date()
    };
    transactionHistory.unshift(transaction);
    
    savePortfolioState();
    
    updatePortfolioDisplay();
    updateTransactionHistory();
    
    withdrawAmountElement.value = '100';
    
    alert(`¡Retiro exitoso! Has retirado ${withdrawAmount.toFixed(2)}. Comisión: ${withdrawalFeeAmount.toFixed(2)}. Neto: ${netAmount.toFixed(2)}`);
}

function resetPortfolio() {
    if (confirm('⚠️ ¿Estás seguro de que quieres reiniciar el portafolio? Se perderán todos los datos.')) {
        clearCurrentUserPortfolio();
        location.reload();
    }
}

// =============================================
// EXPORTAR A EXCEL
// =============================================

function addExportButtonToHeader() {
    console.log('📊 Agregando botón de exportar...');
    
    if (document.getElementById('export-portfolio-btn')) {
        console.log('ℹ️ Botón de exportar ya existe');
        return;
    }
    
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999;
    `;
    
    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-portfolio-btn';
    exportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Exportar';
    exportBtn.style.cssText = `
        background: linear-gradient(135deg, #10b981, #059669) !important;
        color: white !important;
        border: none !important;
        padding: 12px 24px !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 0.95rem !important;
        cursor: pointer !important;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        transition: all 0.3s ease !important;
    `;
    
    exportBtn.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
    };
    
    exportBtn.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
    };
    
    exportBtn.onclick = exportPortfolioToExcel;
    
    exportContainer.appendChild(exportBtn);
    document.body.appendChild(exportContainer);
    
    console.log('✅ Botón de exportar agregado');
}

function exportPortfolioToExcel() {
    console.log('📊 Exportando portafolio...');
    
    if (typeof XLSX === 'undefined') {
        alert('❌ Error: La librería de Excel no está cargada.\n\nAgrega esto al HTML:\n<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>');
        return;
    }
    
    try {
        const workbook = XLSX.utils.book_new();
        
        // 1. HOJA DE RESUMEN
        const summaryData = [
            ['RESUMEN DEL PORTAFOLIO'],
            [''],
            ['Métrica', 'Valor'],
            ['Balance Total', `${portfolio.balance.toFixed(2)}`],
            ['Disponible', `${portfolio.availableBalance.toFixed(2)}`],
            ['Invertido', `${portfolio.totalInvested.toFixed(2)}`],
            ['Ganancia/Pérdida', `${portfolio.totalProfit.toFixed(2)}`],
            ['Porcentaje', `${portfolio.totalProfitPercentage.toFixed(2)}%`],
            ['Número de Inversiones', portfolio.investments.length],
            ['Usuario', getCurrentUserId()],
            [''],
            ['Fecha de Exportación', new Date().toLocaleString('es-ES')]
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
        
        // 2. HOJA DE INVERSIONES ACTUALES
        if (portfolio.investments.length > 0) {
            const investmentsData = [
                ['Criptomoneda', 'Cantidad', 'Precio Compra', 'Precio Actual', 'Inversión', 'Valor Actual', 'Ganancia/Pérdida', '%']
            ];
            
            portfolio.investments.forEach(inv => {
                investmentsData.push([
                    cryptoData[inv.crypto].name,
                    inv.amount.toFixed(6),
                    `${inv.purchasePrice.toFixed(2)}`,
                    `${inv.currentPrice.toFixed(2)}`,
                    `${inv.investmentValue.toFixed(2)}`,
                    `${inv.currentValue.toFixed(2)}`,
                    `${inv.profit.toFixed(2)}`,
                    `${inv.profitPercentage.toFixed(2)}%`
                ]);
            });
            
            const investmentsSheet = XLSX.utils.aoa_to_sheet(investmentsData);
            XLSX.utils.book_append_sheet(workbook, investmentsSheet, 'Inversiones');
        }
        
        // 3. HOJA DE HISTORIAL
        if (transactionHistory.length > 0) {
            const historyData = [
                ['Tipo', 'Criptomoneda', 'Cantidad', 'Valor', 'Comisión', 'Fecha']
            ];
            
            transactionHistory.forEach(tx => {
                const cryptoName = tx.crypto ? cryptoData[tx.crypto].name : 'N/A';
                historyData.push([
                    tx.type === 'buy' ? 'Compra' : tx.type === 'sell' ? 'Venta' : 'Retiro',
                    cryptoName,
                    tx.amount ? tx.amount.toFixed(6) : 'N/A',
                    `${tx.value.toFixed(2)}`,
                    tx.fee ? `${tx.fee.toFixed(2)}` : '$0.00',
                    tx.timestamp.toLocaleString('es-ES')
                ]);
            });
            
            const historySheet = XLSX.utils.aoa_to_sheet(historyData);
            XLSX.utils.book_append_sheet(workbook, historySheet, 'Historial');
        }
        
        const fileName = `Portafolio_${getCurrentUserId()}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        showExportNotification('✅ Portafolio exportado correctamente', 'success');
        console.log('✅ Archivo Excel generado:', fileName);
        
    } catch (error) {
        console.error('❌ Error exportando:', error);
        showExportNotification('❌ Error al exportar el portafolio', 'error');
    }
}

function showExportNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transform: translateX(400px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =============================================
// INICIALIZACIÓN CUANDO CARGA LA PÁGINA
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    init();
    setTimeout(addExportButtonToHeader, 500);
});

if (document.readyState === 'complete') {
    setTimeout(addExportButtonToHeader, 500);
}

console.log('✅ Sistema de portafolios por usuario cargado');
    updateTransactionHistory();
    
    investmentAmountElement.value = '100';
    updateCryptoAmount();
    
    alert(`¡Has comprado ${cryptoAmount.toFixed(6)} ${cryptoData[selectedCrypto].symbol} por $${investmentAmount.toFixed(2)}!`);


function updatePortfolioValues() {
    let totalValue = portfolio.availableBalance;
    let totalInvestment = 0;
    
    portfolio.investments.forEach(investment => {
        investment.currentPrice = cryptoData[investment.crypto].price;
        investment.currentValue = investment.amount * investment.currentPrice;
        investment.profit = investment.currentValue - investment.investmentValue;
        investment.profitPercentage = (investment.profit / investment.investmentValue) * 100;
        
        totalValue += investment.currentValue;
        totalInvestment += investment.investmentValue;
    });
    
    portfolio.totalProfit = totalValue - portfolio.balance;
    portfolio.totalProfitPercentage = (portfolio.totalProfit / portfolio.balance) * 100;
    
    if (!totalBalanceElement) return;
    
    totalBalanceElement.textContent = totalValue.toFixed(2);
    availableBalanceElement.textContent = portfolio.availableBalance.toFixed(2);
    investedAmountElement.textContent = totalInvestment.toFixed(2);
    
    const profitClass = portfolio.totalProfit >= 0 ? 'profit' : 'loss';
    const profitSymbol = portfolio.totalProfit >= 0 ? '+' : '';
    
    totalProfitElement.textContent = `${profitSymbol}$${Math.abs(portfolio.totalProfit).toFixed(2)}`;
    totalProfitElement.className = profitClass;
    
    profitPercentageElement.textContent = `(${profitSymbol}${Math.abs(portfolio.totalProfitPercentage).toFixed(2)}%)`;
    profitPercentageElement.className = profitClass;
    
    if (sellModalBtn) {
        sellModalBtn.disabled = portfolio.investments.length === 0;
    }
}

function updatePortfolioDisplay() {
    updatePortfolioValues();
    
    if (!portfolioListElement) return;
    
    if (portfolio.investments.length === 0) {
        if (emptyPortfolioElement) emptyPortfolioElement.style.display = 'block';
        portfolioListElement.innerHTML = '';
        if (emptyPortfolioElement) portfolioListElement.appendChild(emptyPortfolioElement);
        return;
    }
    
    if (emptyPortfolioElement) emptyPortfolioElement.style.display = 'none';
    portfolioListElement.innerHTML = '';
    
    portfolio.investments.forEach(investment => {
        const investmentElement = document.createElement('div');
        investmentElement.className = 'investment-item';
        
        const profitClass = investment.profit >= 0 ? 'profit' : 'loss';
        const profitSymbol = investment.profit >= 0 ? '+' : '';
        
        investmentElement.innerHTML = `
            <div class="investment-info">
                <h3>
                    <span class="crypto-icon">${cryptoData[investment.crypto].icon}</span>
                    ${cryptoData[investment.crypto].name} (${cryptoData[investment.crypto].symbol})
                </h3>
                <div class="investment-details">
                    ${investment.amount.toFixed(6)} - Comprado a $${investment.purchasePrice.toFixed(2)}
                </div>
            </div>
            <div class="investment-value">
                <div class="current-value">$${investment.currentValue.toFixed(2)}</div>
                <div class="${profitClass}">
                    ${profitSymbol}$${Math.abs(investment.profit).toFixed(2)} (${profitSymbol}${Math.abs(investment.profitPercentage).toFixed(2)}%)
                </div>
            </div>
        `;
        
        portfolioListElement.appendChild(investmentElement);
    });
}

function updateTransactionHistory() {
    if (!transactionHistoryElement) return;
    
    transactionHistoryElement.innerHTML = '';
    
    if (transactionHistory.length === 0) {
        transactionHistoryElement.innerHTML = '<p>No hay transacciones aún.</p>';
        return;
    }
    
    transactionHistory.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = `transaction-item transaction-${transaction.type}`;
        
        const typeText = transaction.type === 'buy' ? 'Compra' : 
                        transaction.type === 'sell' ? 'Venta' : 'Retiro';
        
        const date = transaction.timestamp.toLocaleDateString();
        const time = transaction.timestamp.toLocaleTimeString();
        
        let details = '';
        if (transaction.type === 'buy' || transaction.type === 'sell') {
            details = `${transaction.amount.toFixed(6)} ${cryptoData[transaction.crypto].symbol}`;
        } else {
            details = `Retiro de fondos`;
        }
        
        transactionElement.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-crypto">
                    <i class="fas fa-${transaction.type === 'buy' ? 'shopping-cart' : transaction.type === 'sell' ? 'money-bill-wave' : 'hand-holding-usd'}"></i>
                    ${typeText} - ${transaction.type !== 'withdraw' ? cryptoData[transaction.crypto].name : 'Fondos'}
                </div>
                <div class="transaction-amount">
                    ${details} - ${date} ${time}
                    ${transaction.fee ? ` (Comisión: $${transaction.fee.toFixed(2)})` : ''}
                </div>
            </div>
            <div class="transaction-value">
                $${transaction.type === 'withdraw' ? '-' : ''}${transaction.value.toFixed(2)}
            </div>
        `;
        
        transactionHistoryElement.appendChild(transactionElement);
    });
}

function openSellModal() {
    if (portfolio.investments.length === 0) {
        alert('No tienes inversiones para vender');
        return;
    }
    
    sellCryptoSelect.innerHTML = '';
    portfolio.investments.forEach(investment => {
        if (investment.amount > 0.000001) {
            const option = document.createElement('option');
            option.value = investment.id;
            option.textContent = `${cryptoData[investment.crypto].name} (${cryptoData[investment.crypto].symbol}) - ${investment.amount.toFixed(6)}`;
            sellCryptoSelect.appendChild(option);
        }
    });
    
    if (sellCryptoSelect.children.length === 0) {
        alert('No tienes inversiones válidas para vender');
        return;
    }
    
    updateSellModal();
    sellModal.classList.add('active');
}

function closeSellModalFunc() {
    sellModal.classList.remove('active');
}

function updateSellModal() {
    const selectedId = parseInt(sellCryptoSelect.value);
    const investment = portfolio.investments.find(inv => inv.id === selectedId);
    
    if (!investment) {
        closeSellModalFunc();
        return;
    }
    
    const sellPercentageVal = parseInt(sellPercentage.value);
    sellPercentageValue.textContent = `${sellPercentageVal}%`;
    
    const sellAmount = investment.amount * (sellPercentageVal / 100);
    const currentValue = sellAmount * investment.currentPrice;
    const originalValue = sellAmount * investment.purchasePrice;
    const profit = currentValue - originalValue;
    const profitPercentage = (profit / originalValue) * 100;
    
    const profitClass = profit >= 0 ? 'profit' : 'loss';
    const profitSymbol = profit >= 0 ? '+' : '';
    
    sellCurrentValue.value = `$${currentValue.toFixed(2)}`;
    sellProfit.value = `${profitSymbol}$${Math.abs(profit).toFixed(2)} (${profitSymbol}${Math.abs(profitPercentage).toFixed(2)}%)`;
    sellProfit.className = profitClass;
    
    confirmSellButton.disabled = sellAmount <= 0 || currentValue <= 0;
}

async function handleSell() {
    const selectedId = parseInt(sellCryptoSelect.value);
    const investmentIndex = portfolio.investments.findIndex(inv => inv.id === selectedId);
    
    if (investmentIndex === -1) {
        alert('Error: Inversión no encontrada');
        return;
    }
    
    const investment = portfolio.investments[investmentIndex];
    const sellPercentageVal = parseInt(sellPercentage.value);
    const sellAmount = investment.amount * (sellPercentageVal / 100);
    
    if (sellAmount <= 0) {
        alert('Error: La cantidad a vender debe ser mayor a 0');
        return;
    }
    
    const currentValue = sellAmount * investment.currentPrice;
    const tradingFeeAmount = currentValue * tradingFee;
    const netAmount = currentValue - tradingFeeAmount;
    
    const originalValue = sellAmount * investment.purchasePrice;
    const profit = currentValue - originalValue;
    
    if (sellPercentageVal === 100) {
        portfolio.investments.splice(investmentIndex, 1);
    } else {
        investment.amount -= sellAmount;
        investment.investmentValue = investment.amount * investment.purchasePrice;
        investment.currentValue = investment.amount * investment.currentPrice;
        
        if (investment.amount < 0.000001) {
            portfolio.investments.splice(investmentIndex, 1);
        }
    }
    
    portfolio.availableBalance += netAmount;
    portfolio.totalInvested -= originalValue;
    
    const transaction = {
        type: 'sell',
        crypto: investment.crypto,
        amount: sellAmount,
        value: currentValue,
        fee: tradingFeeAmount,
        profit: profit,
        timestamp: new Date()
    };
    transactionHistory.unshift(transaction);
    
    savePortfolioState();
    
    updatePortfolioDisplay();

}
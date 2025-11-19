// Datos de criptomonedas (más ampliados)
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
    stellar: { name: "Stellar", symbol: "XLM", price: 0.35, change: 0, icon: "*" },
    monero: { name: "Monero", symbol: "XMR", price: 165, change: 0, icon: "ɱ" },
    tezos: { name: "Tezos", symbol: "XTZ", price: 1.5, change: 0, icon: "ꜩ" },
    eos: { name: "EOS", symbol: "EOS", price: 1.2, change: 0, icon: "ε" },
    tron: { name: "Tron", symbol: "TRX", price: 0.12, change: 0, icon: "T" },
    neo: { name: "Neo", symbol: "NEO", price: 12, change: 0, icon: "N" },
    vechain: { name: "Vechain", symbol: "VET", price: 0.03, change: 0, icon: "V" },
    cosmos: { name: "Cosmos", symbol: "ATOM", price: 10, change: 0, icon: "⚛" },
    algorand: { name: "Algorand", symbol: "ALGO", price: 0.35, change: 0, icon: "Ⱥ" },
    filecoin: { name: "Filecoin", symbol: "FIL", price: 8, change: 0, icon: "⨎" },
    avalanche: { name: "Avalanche", symbol: "AVAX", price: 35, change: 0, icon: "A" }
};

// Configuración de comisiones
const tradingFee = 0.0025; // 0.25%
const withdrawalFee = 0.015; // 1.5%
const minWithdrawalFee = 5; // $5 mínimo

// Estado del portafolio del usuario
let portfolio = {
    balance: 0,
    availableBalance: 0,
    investments: [],
    totalProfit: 0,
    totalProfitPercentage: 0,
    totalInvested: 0
};

// Historial de transacciones
let transactionHistory = [];

// Elementos del DOM
const totalBalanceElement = document.getElementById('total-balance');
const availableBalanceElement = document.getElementById('available-balance');
const investedAmountElement = document.getElementById('invested-amount');
const totalProfitElement = document.getElementById('total-profit');
const profitPercentageElement = document.getElementById('profit-percentage');
const marketPricesElement = document.getElementById('market-prices');
const portfolioListElement = document.getElementById('portfolio-list');
const emptyPortfolioElement = document.getElementById('empty-portfolio');
const cryptoSelectElement = document.getElementById('crypto-select');
const investmentAmountElement = document.getElementById('investment-amount');
const cryptoAmountElement = document.getElementById('crypto-amount');
const buyButtonElement = document.getElementById('buy-button');
const transactionHistoryElement = document.getElementById('transaction-history');
const amountButtons = document.querySelectorAll('.amount-buttons button');
const themeToggleButton = document.getElementById('theme-toggle');
const setupModal = document.getElementById('setup-modal');
const initialBalanceInput = document.getElementById('initial-balance');
const startTradingButton = document.getElementById('start-trading');
const balancePresets = document.querySelectorAll('.balance-presets button');
const refreshPricesButton = document.getElementById('refresh-prices');
const sellModalBtn = document.getElementById('sell-modal-btn');
const sellModal = document.getElementById('sell-modal');
const closeSellModal = document.getElementById('close-sell-modal');
const sellCryptoSelect = document.getElementById('sell-crypto-select');
const sellPercentage = document.getElementById('sell-percentage');
const sellPercentageValue = document.getElementById('sell-percentage-value');
const sellCurrentValue = document.getElementById('sell-current-value');
const sellProfit = document.getElementById('sell-profit');
const confirmSellButton = document.getElementById('confirm-sell');
const withdrawAmountElement = document.getElementById('withdraw-amount');
const withdrawButton = document.getElementById('withdraw-button');

function init() {
    // Configurar el selector de criptomonedas
    populateCryptoSelect();
    
    // Configurar eventos
    setupEventListeners();
    
    // Configurar el input de capital inicial
    initialBalanceInput.addEventListener('input', validateInitialBalance);
    
    // Mostrar modal de configuración inicial
    setupModal.style.display = 'flex';
    
    // Actualizar precios cada 5 segundos (simulación)
    setInterval(updateMarketPrices, 5000);
    
    // Validación inicial
    validateInitialBalance();
    
    // Configurar autoguardado
    setupPortfolioAutoSave();
}

// Configurar event listeners
function setupEventListeners() {
    // Solo agregar listeners si los elementos existen
    if (buyButtonElement) {
        buyButtonElement.addEventListener('click', handleBuy);
    }
    
    if (investmentAmountElement) {
        investmentAmountElement.addEventListener('input', updateCryptoAmount);
    }
    
    if (cryptoSelectElement) {
        cryptoSelectElement.addEventListener('change', updateCryptoAmount);
    }
    
    // Botones de porcentaje rápido
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
    
    // Configuración inicial - verificar que existen
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
    
    // Refrescar precios manualmente
    if (refreshPricesButton) {
        refreshPricesButton.addEventListener('click', updateMarketPrices);
    }
    
    // Modal de venta - verificar existencia
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
    
    // Retiro de fondos
    if (withdrawButton) {
        withdrawButton.addEventListener('click', handleWithdraw);
    }
}

function validateInitialBalance() {
    const initialBalance = parseFloat(initialBalanceInput.value);
    const startButton = document.getElementById('start-trading');
    
    if (isNaN(initialBalance) || initialBalance < 100 || initialBalance > 1000000) {
        startButton.disabled = true;
        initialBalanceInput.style.borderColor = 'var(--loss)';
    } else {
        startButton.disabled = false;
        initialBalanceInput.style.borderColor = 'var(--profit)';
    }
}

// Poblar selector de criptomonedas
function populateCryptoSelect() {
    cryptoSelectElement.innerHTML = '';
    
    for (const crypto in cryptoData) {
        const option = document.createElement('option');
        option.value = crypto;
        option.textContent = `${cryptoData[crypto].name} (${cryptoData[crypto].symbol})`;
        cryptoSelectElement.appendChild(option);
    }
}

// Alternar entre tema claro y oscuro
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    
    const icon = themeToggleButton.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Iniciar trading con el capital inicial
function startTrading() {
    const initialBalance = parseFloat(initialBalanceInput.value);
    
    // Validaciones más robustas
    if (isNaN(initialBalance) || initialBalance < 100) {
        alert('El capital inicial debe ser de al menos $100');
        initialBalanceInput.focus();
        return;
    }
    
    if (initialBalance > 1000000) {
        alert('El capital inicial no puede exceder $1,000,000');
        initialBalanceInput.focus();
        return;
    }
    
    // Configurar el portafolio
    portfolio.balance = initialBalance;
    portfolio.availableBalance = initialBalance;
    
    // Ocultar modal
    setupModal.style.display = 'none';
    
    // Inicializar componentes
    updateMarketPrices();
    updatePortfolioDisplay();
    updateTransactionHistory();
    updateCryptoAmount();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        alert(`¡Bienvenido a CryptoSim! Tu capital inicial de $${initialBalance.toLocaleString()} ha sido configurado. ¡Buena suerte en tus inversiones!`);
    }, 500);
}

// Actualizar precios del mercado (simulación)
function updateMarketPrices() {
    // Generar cambios aleatorios en los precios
    for (const crypto in cryptoData) {
        // Cambio entre -5% y +5%
        const changePercent = (Math.random() * 10 - 5) / 100;
        cryptoData[crypto].change = changePercent * 100;
        cryptoData[crypto].price *= (1 + changePercent);
        
        // Asegurar que los precios no bajen de cierto umbral
        if (cryptoData[crypto].price < 0.01) {
            cryptoData[crypto].price = 0.01;
        }
    }
    
    // Actualizar la visualización de precios
    marketPricesElement.innerHTML = '';
    
    for (const crypto in cryptoData) {
        const priceElement = document.createElement('div');
        priceElement.className = 'crypto-price';
        priceElement.setAttribute('data-symbol', cryptoData[crypto].symbol);
        
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
        
        // Agregar event listener para selección rápida
        priceElement.addEventListener('click', () => {
            selectCryptoFromMarket(cryptoData[crypto].symbol);
        });
        
        // Agregar efecto hover con tooltip
        priceElement.title = `Haz clic para seleccionar ${cryptoData[crypto].name}`;
        
        marketPricesElement.appendChild(priceElement);
    }
    
    // Actualizar valores del portafolio
    updatePortfolioValues();
}

// Actualizar la cantidad de criptomoneda a comprar
function updateCryptoAmount() {
    const selectedCrypto = cryptoSelectElement.value;
    const investmentAmount = parseFloat(investmentAmountElement.value) || 0;
    const cryptoPrice = cryptoData[selectedCrypto].price;
    
    if (investmentAmount > 0 && cryptoPrice > 0) {
        const cryptoAmount = investmentAmount / cryptoPrice;
        cryptoAmountElement.value = cryptoAmount.toFixed(6);
    } else {
        cryptoAmountElement.value = '0';
    }
    
    // Validar si el monto es suficiente
    if (investmentAmount > portfolio.availableBalance) {
        buyButtonElement.disabled = true;
        investmentAmountElement.style.borderColor = 'var(--loss)';
    } else {
        buyButtonElement.disabled = false;
        investmentAmountElement.style.borderColor = '';
    }
}

// Manejar la compra de criptomonedas
async function handleBuy() {
    const selectedCrypto = cryptoSelectElement.value;
    const investmentAmount = parseFloat(investmentAmountElement.value);
    
    // Validaciones
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
    
    // Verificar si hay fondos suficientes incluyendo la comisión
    if (totalCost > portfolio.availableBalance) {
        alert(`Fondos insuficientes. Incluyendo comisión de $${tradingFeeAmount.toFixed(2)}, necesitas $${totalCost.toFixed(2)}`);
        return;
    }
    
    // Crear nueva inversión
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
    
    // Agregar al portafolio
    portfolio.investments.push(newInvestment);
    portfolio.availableBalance -= totalCost;
    portfolio.totalInvested += investmentAmount;
    
    // Agregar al historial
    const transaction = {
        type: 'buy',
        crypto: selectedCrypto,
        amount: cryptoAmount,
        value: investmentAmount,
        fee: tradingFeeAmount,
        timestamp: new Date()
    };
    transactionHistory.unshift(transaction);
    
    // ✅ GUARDAR EN BASE DE DATOS
    await saveTransactionToDatabase(transaction);
    
    // Actualizar visualizaciones
    updatePortfolioDisplay();
    updateTransactionHistory();
    
    // Resetear formulario
    investmentAmountElement.value = '100';
    updateCryptoAmount();
    
    // Mostrar confirmación
    alert(`¡Has comprado ${cryptoAmount.toFixed(6)} ${cryptoData[selectedCrypto].symbol} por $${investmentAmount.toFixed(2)}! Comisión: $${tradingFeeAmount.toFixed(2)}`);
}

// Actualizar valores del portafolio
function updatePortfolioValues() {
    let totalValue = portfolio.availableBalance;
    let totalInvestment = 0;
    
    // Limpiar inversiones con cantidad 0 antes de calcular
    cleanZeroInvestments();
    
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
    
    // Actualizar elementos del DOM
    totalBalanceElement.textContent = totalValue.toFixed(2);
    availableBalanceElement.textContent = portfolio.availableBalance.toFixed(2);
    investedAmountElement.textContent = totalInvestment.toFixed(2);
    
    const profitClass = portfolio.totalProfit >= 0 ? 'profit' : 'loss';
    const profitSymbol = portfolio.totalProfit >= 0 ? '+' : '';
    
    totalProfitElement.textContent = `${profitSymbol}$${Math.abs(portfolio.totalProfit).toFixed(2)}`;
    totalProfitElement.className = profitClass;
    
    profitPercentageElement.textContent = `(${profitSymbol}${Math.abs(portfolio.totalProfitPercentage).toFixed(2)}%)`;
    profitPercentageElement.className = profitClass;
    
    // Habilitar/deshabilitar botón de vender
    sellModalBtn.disabled = portfolio.investments.length === 0;
}

function selectCryptoFromMarket(cryptoSymbol) {
    // Encontrar la clave de la criptomoneda basado en el símbolo
    for (const cryptoKey in cryptoData) {
        if (cryptoData[cryptoKey].symbol === cryptoSymbol) {
            cryptoSelectElement.value = cryptoKey;
            updateCryptoAmount();
            
            // Hacer scroll suave a la sección de trading
            document.querySelector('.trading-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Efecto visual de confirmación
            const tradingSection = document.querySelector('.trading-section');
            tradingSection.style.boxShadow = '0 0 0 3px var(--accent-primary)';
            setTimeout(() => {
                tradingSection.style.boxShadow = '';
            }, 2000);
            
            break;
        }
    }
}

// Actualizar visualización del portafolio
function updatePortfolioDisplay() {
    updatePortfolioValues();
    
    if (portfolio.investments.length === 0) {
        emptyPortfolioElement.style.display = 'block';
        portfolioListElement.innerHTML = '';
        portfolioListElement.appendChild(emptyPortfolioElement);
        return;
    }
    
    emptyPortfolioElement.style.display = 'none';
    portfolioListElement.innerHTML = '';
    
    portfolio.investments.forEach(investment => {
        const investmentElement = document.createElement('div');
        investmentElement.className = 'investment-item';
        investmentElement.setAttribute('data-id', investment.id);
        
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

// Este código va en CADA página donde quieras mostrar el nombre
function checkIfUserIsLoggedIn() {
    // 1. Obtener datos del usuario guardados
    const userData = localStorage.getItem('currentUser');
    
    // 2. Si NO hay usuario, mostrar botones normales
    if (!userData) {
        return false;
    }
    
    // 3. Si SÍ hay usuario, convertirlo de texto a objeto
    const user = JSON.parse(userData);
    return user;
}





// Actualizar historial de transacciones
function updateTransactionHistory() {
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

// Abrir modal de venta
function openSellModal() {
    if (portfolio.investments.length === 0) {
        alert('No tienes inversiones para vender');
        return;
    }
    
    // Poblar selector de inversiones
    sellCryptoSelect.innerHTML = '';
    portfolio.investments.forEach(investment => {
        // Solo mostrar inversiones con cantidad mayor a 0
        if (investment.amount > 0.000001) {
            const option = document.createElement('option');
            option.value = investment.id;
            option.textContent = `${cryptoData[investment.crypto].name} (${cryptoData[investment.crypto].symbol}) - ${investment.amount.toFixed(6)}`;
            sellCryptoSelect.appendChild(option);
        }
    });
    
    // Si no hay inversiones válidas después de filtrar
    if (sellCryptoSelect.children.length === 0) {
        alert('No tienes inversiones válidas para vender');
        return;
    }
    
    // Actualizar información inicial
    updateSellModal();
    
    // Mostrar modal
    sellModal.classList.add('active');
}

// Cerrar modal de venta
function closeSellModalFunc() {
    sellModal.classList.remove('active');
}

// Actualizar información en el modal de venta
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
    
    // Habilitar/deshabilitar botón de venta basado en validaciones
    if (sellAmount <= 0 || currentValue <= 0) {
        confirmSellButton.disabled = true;
        confirmSellButton.title = 'No puedes vender una cantidad igual a 0';
    } else {
        confirmSellButton.disabled = false;
        confirmSellButton.title = '';
    }
}

// Manejar la venta de criptomonedas
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
    
    // Validar que la cantidad a vender sea mayor a 0
    if (sellAmount <= 0) {
        alert('Error: La cantidad a vender debe ser mayor a 0');
        return;
    }
    
    const currentValue = sellAmount * investment.currentPrice;
    const tradingFeeAmount = currentValue * tradingFee;
    const netAmount = currentValue - tradingFeeAmount;
    
    // Validar que el valor actual sea mayor a 0
    if (currentValue <= 0) {
        alert('Error: No puedes vender una criptomoneda con valor 0');
        return;
    }
    
    // Calcular ganancia/pérdida
    const originalValue = sellAmount * investment.purchasePrice;
    const profit = currentValue - originalValue;
    
    // Actualizar portafolio
    if (sellPercentageVal === 100) {
        // Vender toda la inversión
        portfolio.investments.splice(investmentIndex, 1);
    } else {
        // Vender solo una parte
        investment.amount -= sellAmount;
        investment.investmentValue = investment.amount * investment.purchasePrice;
        investment.currentValue = investment.amount * investment.currentPrice;
        
        // Si después de vender la cantidad es muy pequeña (casi 0), eliminar la inversión
        if (investment.amount < 0.000001) {
            portfolio.investments.splice(investmentIndex, 1);
        }
    }
    
    portfolio.availableBalance += netAmount;
    portfolio.totalInvested -= originalValue;
    
    // Agregar al historial
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
    
    // ✅ GUARDAR EN BASE DE DATOS
    await saveTransactionToDatabase(transaction);
    
    // Actualizar visualizaciones
    updatePortfolioDisplay();
    updateTransactionHistory();
    closeSellModalFunc();
    
    // Mostrar confirmación
    const profitSymbol = profit >= 0 ? '+' : '';
    alert(`¡Has vendido ${sellAmount.toFixed(6)} ${cryptoData[investment.crypto].symbol} por $${currentValue.toFixed(2)}! Comisión: $${tradingFeeAmount.toFixed(2)}. Ganancia/Pérdida: ${profitSymbol}$${Math.abs(profit).toFixed(2)}`);
}

function cleanZeroInvestments() {
    portfolio.investments = portfolio.investments.filter(investment => {
        return investment.amount > 0.000001 && investment.currentValue > 0.01;
    });
}

// Manejar retiro de fondos
async function handleWithdraw() {
    const withdrawAmount = parseFloat(withdrawAmountElement.value);
    
    // Validaciones
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
    
    // Calcular comisión
    let withdrawalFeeAmount = withdrawAmount * withdrawalFee;
    if (withdrawalFeeAmount < minWithdrawalFee) {
        withdrawalFeeAmount = minWithdrawalFee;
    }
    
    const netAmount = withdrawAmount - withdrawalFeeAmount;
    
    if (netAmount <= 0) {
        alert('El monto de retiro es insuficiente para cubrir la comisión');
        return;
    }
    
    // Confirmar retiro
    const confirmWithdraw = confirm(
        `¿Estás seguro de que quieres retirar $${withdrawAmount.toFixed(2)}?\n` +
        `Comisión de retiro: $${withdrawalFeeAmount.toFixed(2)}\n` +
        `Recibirás: $${netAmount.toFixed(2)}`
    );
    
    if (!confirmWithdraw) return;
    
    // Realizar retiro
    portfolio.availableBalance -= withdrawAmount;
    portfolio.balance -= withdrawAmount;
    
    // Agregar al historial
    const transaction = {
        type: 'withdraw',
        value: withdrawAmount,
        fee: withdrawalFeeAmount,
        timestamp: new Date()
    };
    transactionHistory.unshift(transaction);
    
    // ✅ GUARDAR EN BASE DE DATOS
    await saveTransactionToDatabase(transaction);
    
    // Actualizar visualizaciones
    updatePortfolioDisplay();
    updateTransactionHistory();
    
    // Resetear campo
    withdrawAmountElement.value = '100';
    
    alert(`¡Retiro exitoso! Has retirado $${withdrawAmount.toFixed(2)}. Comisión: $${withdrawalFeeAmount.toFixed(2)}. Neto: $${netAmount.toFixed(2)}`);
}

// =============================================
// FUNCIONES PARA BASE DE DATOS
// =============================================

// Funciones para integración con la base de datos
// En portafolio.js - VERSIÓN MEJORADA CON ESPERA
async function saveTransactionToDatabase(transaction) {
    if (!window.portfolioDB) {
        console.warn('⚠️ PortfolioDB no está disponible');
        return;
    }

    try {
        // Esperar hasta que PortfolioDB esté completamente inicializado
        let attempts = 0;
        const maxAttempts = 10; // Máximo 5 segundos de espera
        
        while (!portfolioDB.initialized && attempts < maxAttempts) {
            console.log(`⏳ Esperando inicialización de PortfolioDB... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms
            attempts++;
        }

        if (!portfolioDB.initialized) {
            console.warn('⚠️ PortfolioDB no se inicializó a tiempo, guardando en pendientes');
        }

        let result;
        
        switch (transaction.type) {
            case 'buy':
                result = await portfolioDB.saveBuyTransaction(transaction);
                break;
            case 'sell':
                const investment = portfolio.investments.find(inv => 
                    inv.crypto === transaction.crypto
                );
                if (investment) {
                    result = await portfolioDB.saveSellTransaction(transaction, investment);
                } else {
                    console.error('❌ No se encontró la inversión para vender:', transaction.crypto);
                }
                break;
            case 'withdraw':
                result = await portfolioDB.saveWithdrawTransaction(transaction);
                break;
        }
        
        if (result && result.success) {
            console.log('✅ Transacción guardada:', result);
            
            if (result.pending) {
                console.log('📝 Transacción en cola, se procesará cuando PortfolioDB esté listo');
            } else if (result.local) {
                console.log('💾 Transacción guardada localmente');
            } else {
                console.log('🚀 Transacción guardada en la base de datos');
            }
        }
    } catch (error) {
        console.error('❌ Error guardando transacción:', error);
    }
}

async function savePortfolioSnapshot() {
    if (!window.portfolioDB) {
        console.warn('⚠️ PortfolioDB no está disponible');
        return;
    }

    try {
        await portfolioDB.savePortfolioSnapshot(portfolio);
        console.log('✅ Snapshot del portafolio guardado');
    } catch (error) {
        console.error('❌ Error guardando snapshot:', error);
    }
}

// Guardar snapshot periódicamente y al cerrar la página
function setupPortfolioAutoSave() {
    // Guardar snapshot cada 2 minutos
    setInterval(() => {
        if (portfolio.investments.length > 0) {
            savePortfolioSnapshot();
        }
    }, 120000);
    
    // Guardar snapshot cuando se cierre la página
    window.addEventListener('beforeunload', () => {
        if (portfolio.investments.length > 0) {
            savePortfolioSnapshot();
        }
    });
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);
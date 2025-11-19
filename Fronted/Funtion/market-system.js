// market-system.js - Sistema de precios de criptomonedas en tiempo real

class MarketSystem {
    constructor() {
        this.cryptos = [
            { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
            { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
            { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
            { id: 'ripple', symbol: 'XRP', name: 'XRP' },
            { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
            { id: 'solana', symbol: 'SOL', name: 'Solana' },
            { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
            { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
            { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
            { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
            { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
            { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
            { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
            { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
            { id: 'monero', symbol: 'XMR', name: 'Monero' },
            { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
            { id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
            { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
            { id: 'vechain', symbol: 'VET', name: 'VeChain' },
            { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' }
        ];
        
        this.prices = {};
        this.init();
    }

    async init() {
        console.log('💰 Inicializando sistema de mercado...');
        await this.loadPrices();
        this.setupMarketRefresh();
        console.log('✅ Sistema de mercado listo');
    }

    async loadPrices() {
        try {
            this.showLoadingState();
            
            const prices = await this.fetchPrices();
            this.prices = prices;
            this.updateMarketUI();
            
            console.log(`✅ Precios de ${Object.keys(prices).length} criptos cargados`);
            
        } catch (error) {
            console.error('❌ Error cargando precios:', error);
            this.showErrorState();
            // Cargar precios de ejemplo si falla la API
            this.prices = this.getFallbackPrices();
            this.updateMarketUI();
        }
    }

    async fetchPrices() {
        try {
            const ids = this.cryptos.map(crypto => crypto.id).join(',');
            const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processPriceData(data);
            
        } catch (error) {
            console.warn('⚠️ Error con API externa, usando precios de ejemplo');
            throw error;
        }
    }

    processPriceData(apiData) {
        const processedData = {};
        
        this.cryptos.forEach(crypto => {
            const cryptoData = apiData[crypto.id];
            if (cryptoData) {
                processedData[crypto.symbol] = {
                    price: cryptoData.usd,
                    change: cryptoData.usd_24h_change,
                    marketCap: cryptoData.usd_market_cap,
                    symbol: crypto.symbol,
                    name: crypto.name
                };
            }
        });
        
        return processedData;
    }

    getFallbackPrices() {
        // Precios de ejemplo con variaciones realistas
        const basePrices = {
            'BTC': { price: 45230, change: 2.34, marketCap: 885000000000 },
            'ETH': { price: 3245, change: 1.78, marketCap: 389000000000 },
            'BNB': { price: 325, change: 0.45, marketCap: 51000000000 },
            'XRP': { price: 0.62, change: -0.23, marketCap: 33000000000 },
            'ADA': { price: 0.48, change: 3.12, marketCap: 17000000000 },
            'SOL': { price: 102, change: 5.67, marketCap: 41000000000 },
            'DOT': { price: 7.25, change: 1.89, marketCap: 9000000000 },
            'DOGE': { price: 0.08, change: -1.45, marketCap: 11000000000 },
            'MATIC': { price: 0.85, change: 2.31, marketCap: 7500000000 },
            'LTC': { price: 71.50, change: 0.67, marketCap: 5200000000 },
            'LINK': { price: 14.20, change: 4.12, marketCap: 7800000000 },
            'XLM': { price: 0.125, change: -0.89, marketCap: 3300000000 },
            'AVAX': { price: 36.80, change: 6.45, marketCap: 13000000000 },
            'ATOM': { price: 9.45, change: 2.18, marketCap: 3300000000 },
            'XMR': { price: 165, change: 1.23, marketCap: 3000000000 },
            'ETC': { price: 26.40, change: -2.15, marketCap: 3700000000 },
            'ALGO': { price: 0.18, change: 3.45, marketCap: 1400000000 },
            'BCH': { price: 245, change: 0.89, marketCap: 4700000000 },
            'VET': { price: 0.028, change: 4.67, marketCap: 2000000000 },
            'FIL': { price: 5.60, change: -1.23, marketCap: 2400000000 }
        };

        // Agregar pequeñas variaciones aleatorias para simular mercado real
        const variedPrices = {};
        Object.keys(basePrices).forEach(symbol => {
            const base = basePrices[symbol];
            const randomVariation = (Math.random() - 0.5) * 0.5; // ±0.25%
            
            variedPrices[symbol] = {
                ...base,
                price: base.price * (1 + randomVariation / 100),
                change: base.change + randomVariation
            };
        });

        return variedPrices;
    }

    updateMarketUI() {
        const marketCards = document.querySelector('.market-cards');
        if (!marketCards) {
            console.error('❌ No se encontró el contenedor .market-cards');
            return;
        }

        console.log('🔄 Actualizando UI de mercado...');
        
        // Limpiar contenedor
        marketCards.innerHTML = '';

        // Crear tarjetas para las primeras 8 criptos (para mejor visualización)
        const displayCryptos = this.cryptos.slice(0, 8);
        
        displayCryptos.forEach(crypto => {
            const priceData = this.prices[crypto.symbol];
            if (priceData) {
                const marketCard = this.createMarketCard(crypto, priceData);
                marketCards.appendChild(marketCard);
            }
        });

        console.log(`✅ UI actualizada con ${displayCryptos.length} criptomonedas`);
    }

    createMarketCard(crypto, priceData) {
        const card = document.createElement('div');
        card.className = 'market-card';
        card.innerHTML = `
            <div class="crypto-header">
                <div class="crypto-icon" style="background: ${this.getCryptoColor(crypto.symbol)}">
                    ${this.getCryptoIcon(crypto.symbol)}
                </div>
                <div class="crypto-name">
                    <h3>${crypto.name}</h3>
                    <span>${crypto.symbol}</span>
                </div>
            </div>
            <div class="price">$${this.formatPrice(priceData.price)}</div>
            <div class="change ${priceData.change >= 0 ? 'positive' : 'negative'}">
                ${priceData.change >= 0 ? '↗' : '↘'} ${priceData.change.toFixed(2)}%
            </div>
            <div class="market-cap">Cap: $${this.formatMarketCap(priceData.marketCap)}</div>
            <div class="price-update-indicator"></div>
        `;

        return card;
    }

    getCryptoIcon(symbol) {
        const icons = {
            'BTC': '₿',
            'ETH': 'Ξ',
            'BNB': 'ⓑ',
            'XRP': '✕',
            'ADA': 'A',
            'SOL': '◎',
            'DOT': '●',
            'DOGE': 'Ð',
            'MATIC': '⬡',
            'LTC': 'Ł',
            'LINK': '🔗',
            'XLM': '★',
            'AVAX': '❄',
            'ATOM': '⚛',
            'XMR': 'ɱ',
            'ETC': 'ξ',
            'ALGO': 'Α',
            'BCH': '฿',
            'VET': 'V',
            'FIL': '📁'
        };
        return icons[symbol] || '₿';
    }

    getCryptoColor(symbol) {
        const colors = {
            'BTC': 'linear-gradient(135deg, #f59e0b, #d97706)',
            'ETH': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            'BNB': 'linear-gradient(135deg, #f0b90b, #f0b90b)',
            'XRP': 'linear-gradient(135deg, #00aae4, #00aae4)',
            'ADA': 'linear-gradient(135deg, #0033ad, #0033ad)',
            'SOL': 'linear-gradient(135deg, #00ffbd, #00ffbd)',
            'DOT': 'linear-gradient(135deg, #e6007a, #e6007a)',
            'DOGE': 'linear-gradient(135deg, #c2a633, #c2a633)',
            'MATIC': 'linear-gradient(135deg, #8247e5, #8247e5)',
            'LTC': 'linear-gradient(135deg, #bfbbbb, #bfbbbb)',
            'LINK': 'linear-gradient(135deg, #2a5ada, #2a5ada)',
            'XLM': 'linear-gradient(135deg, #08b5e5, #08b5e5)',
            'AVAX': 'linear-gradient(135deg, #e84142, #e84142)',
            'ATOM': 'linear-gradient(135deg, #2e3148, #2e3148)',
            'XMR': 'linear-gradient(135deg, #ff6600, #ff6600)',
            'ETC': 'linear-gradient(135deg, #04a839, #04a839)',
            'ALGO': 'linear-gradient(135deg, #000000, #000000)',
            'BCH': 'linear-gradient(135deg, #8dc351, #8dc351)',
            'VET': 'linear-gradient(135deg, #15bdfc, #15bdfc)',
            'FIL': 'linear-gradient(135deg, #0090ff, #0090ff)'
        };
        return colors[symbol] || 'linear-gradient(135deg, #4cc9f0, #3aa8d8)';
    }

    formatPrice(price) {
        if (price >= 1000) {
            return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
        } else if (price >= 1) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        }
    }

    formatMarketCap(marketCap) {
        if (marketCap >= 1000000000) {
            return (marketCap / 1000000000).toFixed(1) + 'B';
        } else if (marketCap >= 1000000) {
            return (marketCap / 1000000).toFixed(1) + 'M';
        } else {
            return marketCap.toLocaleString('en-US');
        }
    }

    setupMarketRefresh() {
        // Actualizar cada 30 segundos
        setInterval(async () => {
            console.log('🔄 Actualizando precios...');
            await this.loadPrices();
        }, 30000);

        // También agregar animación de actualización
        setInterval(() => {
            this.addPriceUpdateAnimation();
        }, 30000);
    }

    addPriceUpdateAnimation() {
        document.querySelectorAll('.market-card').forEach(card => {
            card.classList.add('price-update');
            setTimeout(() => {
                card.classList.remove('price-update');
            }, 1000);
        });
    }

    showLoadingState() {
        const marketCards = document.querySelector('.market-cards');
        if (marketCards) {
            marketCards.innerHTML = `
                <div class="market-loading" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div class="loading-spinner"></div>
                    <p>Cargando precios en tiempo real...</p>
                </div>
            `;
        }
    }

    showErrorState() {
        const marketCards = document.querySelector('.market-cards');
        if (marketCards) {
            marketCards.innerHTML = `
                <div class="market-error" style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #fef2f2; color: #dc2626; border-radius: 12px;">
                    <p>⚠️ No se pudieron cargar los precios en tiempo real.</p>
                    <p>Mostrando precios de ejemplo.</p>
                </div>
            `;
        }
    }
}

// Inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('💰 Inicializando MarketSystem...');
        window.marketSystem = new MarketSystem();
    });
} else {
    console.log('💰 Inicializando MarketSystem (DOM ya listo)...');
    window.marketSystem = new MarketSystem();
}
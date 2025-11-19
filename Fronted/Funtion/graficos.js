// graficos.js - Sistema completo de gráficos con interactividad

class TradingCharts {
    constructor() {
        this.currentCurrency = 'BTC';
        this.currentTimeframe = '1h';
        this.chart = null;
        this.depthChart = null;
        this.volumeChart = null;
        this.tooltip = null;
        this.isDrawing = false;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Trading Charts...');
        this.createTooltip();
        this.setupEventListeners();
        this.renderChart();
        this.renderAdditionalCharts();
        this.startLiveUpdates();
        this.updateMarketData();
        console.log('✅ Trading Charts listo');
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'chart-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(10, 14, 23, 0.95);
            border: 1px solid #00f3ff;
            border-radius: 10px;
            padding: 12px;
            color: white;
            font-size: 14px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 243, 255, 0.3);
            z-index: 1000;
            min-width: 150px;
        `;
        this.tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-price" style="font-size: 16px; font-weight: bold; color: #00f3ff;">$0.00</div>
                <div class="tooltip-time" style="color: #b0b0b0; font-size: 12px;">00:00</div>
                <div class="tooltip-change" style="font-weight: 600;">+0.00%</div>
            </div>
        `;
        document.body.appendChild(this.tooltip);
    }

    setupEventListeners() {
        // Selector de divisas
        document.querySelectorAll('.currency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currency = e.currentTarget.dataset.currency;
                this.switchCurrency(currency);
                
                document.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Selector de timeframe
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const timeframe = e.currentTarget.dataset.timeframe;
                this.switchTimeframe(timeframe);
                
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Botones de acción del gráfico
        document.querySelectorAll('.chart-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.title;
                this.handleChartAction(action);
                
                // Toggle active state
                document.querySelectorAll('.chart-action-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Event listeners para el canvas del gráfico
        const chartCanvas = document.getElementById('tradingChart');
        if (chartCanvas) {
            chartCanvas.addEventListener('mousemove', (e) => this.handleChartHover(e));
            chartCanvas.addEventListener('mouseleave', () => this.hideTooltip());
        }
    }

    handleChartAction(action) {
        console.log('🔧 Acción del gráfico:', action);
        switch(action) {
            case 'Indicadores':
                this.toggleIndicators();
                break;
            case 'Dibujar':
                this.toggleDrawingTools();
                break;
            case 'Comparar':
                this.toggleComparison();
                break;
        }
    }

    toggleIndicators() {
        const indicators = document.querySelector('.indicators-grid');
        if (indicators) {
            indicators.classList.toggle('collapsed');
            this.showNotification('Indicadores ' + (indicators.classList.contains('collapsed') ? 'ocultos' : 'mostrados'));
        }
    }

    toggleDrawingTools() {
        this.isDrawing = !this.isDrawing;
        const chartCanvas = document.getElementById('tradingChart');
        if (chartCanvas) {
            chartCanvas.style.cursor = this.isDrawing ? 'crosshair' : 'default';
        }
        this.showNotification('Herramientas de dibujo ' + (this.isDrawing ? 'activadas' : 'desactivadas'));
    }

    toggleComparison() {
        this.showNotification('Modo comparación activado');
    }

    switchCurrency(currency) {
        console.log('🔄 Cambiando a:', currency);
        
        // Animación de transición suave
        const chartWrapper = document.querySelector('.chart-wrapper');
        if (chartWrapper) {
            chartWrapper.style.opacity = '0.7';
            chartWrapper.style.transition = 'opacity 0.3s ease';
        }
        
        this.currentCurrency = currency;
        this.updateChartInfo();
        
        // Pequeño delay para la transición
        setTimeout(() => {
            this.renderChart();
            this.updateMarketData();
            
            // Restaurar opacidad
            if (chartWrapper) {
                chartWrapper.style.opacity = '1';
            }
            
            this.showNotification(`Mostrando gráfico de ${this.getCurrencyData(currency).name}`);
        }, 300);
    }

    switchTimeframe(timeframe) {
        console.log('⏰ Cambiando timeframe a:', timeframe);
        this.currentTimeframe = timeframe;
        this.renderChart();
        this.showNotification(`Timeframe cambiado a ${timeframe}`);
    }

    updateChartInfo() {
        const currencyData = this.getCurrencyData(this.currentCurrency);
        const titleElement = document.getElementById('currentChartTitle');
        const priceElement = document.querySelector('.current-price');
        const changeElement = document.querySelector('.price-change');

        if (titleElement) {
            titleElement.textContent = `${currencyData.name} (${currencyData.symbol}/USD)`;
        }
        if (priceElement) {
            priceElement.textContent = `$${currencyData.price.toLocaleString()}`;
        }
        if (changeElement) {
            changeElement.textContent = `${currencyData.change >= 0 ? '+' : ''}${currencyData.change}%`;
            changeElement.className = `price-change ${currencyData.change >= 0 ? 'positive' : 'negative'}`;
        }
    }

    getCurrencyData(currency) {
      const data = {
        BTC: { name: 'Bitcoin', symbol: 'BTC', price: 67432.15, change: 2.34 },
        ETH: { name: 'Ethereum', symbol: 'ETH', price: 3876.42, change: 1.78 },
        ADA: { name: 'Cardano', symbol: 'ADA', price: 0.52, change: -0.52 },
        SOL: { name: 'Solana', symbol: 'SOL', price: 145.67, change: 5.21 },
        DOGE: { name: 'Dogecoin', symbol: 'DOGE', price: 0.15, change: 3.45 },
        XRP: { name: 'Ripple', symbol: 'XRP', price: 0.62, change: -1.05 },
        DOT: { name: 'Polkadot', symbol: 'DOT', price: 7.89, change: 1.23 },
        LTC: { name: 'Litecoin', symbol: 'LTC', price: 75.42, change: 0.89 },
        LINK: { name: 'Chainlink', symbol: 'LINK', price: 18.25, change: 2.15 },
        XLM: { name: 'Stellar', symbol: 'XLM', price: 0.35, change: -0.75 },
        XMR: { name: 'Monero', symbol: 'XMR', price: 165.80, change: 1.45 },
        XTZ: { name: 'Tezos', symbol: 'XTZ', price: 1.52, change: -1.20 },
        EOS: { name: 'EOS', symbol: 'EOS', price: 1.25, change: 0.45 },
        TRX: { name: 'Tron', symbol: 'TRX', price: 0.12, change: 2.35 },
        NEO: { name: 'Neo', symbol: 'NEO', price: 12.80, change: -0.65 },
        VET: { name: 'Vechain', symbol: 'VET', price: 0.03, change: 4.25 },
        ATOM: { name: 'Cosmos', symbol: 'ATOM', price: 10.45, change: 1.85 },
        ALGO: { name: 'Algorand', symbol: 'ALGO', price: 0.35, change: -2.15 },
        FIL: { name: 'Filecoin', symbol: 'FIL', price: 8.20, change: 3.75 },
        AVAX: { name: 'Avalanche', symbol: 'AVAX', price: 35.60, change: 6.25 },
        BNB: { name: 'Binance Coin', symbol: 'BNB', price: 585.30, change: 1.25 },
        MATIC: { name: 'Polygon', symbol: 'MATIC', price: 0.85, change: -0.45 }
    };
        return data[currency] || data.BTC;
    }

    renderChart() {
        const ctx = document.getElementById('tradingChart');
        if (!ctx) {
            console.error('❌ No se encontró el canvas del gráfico');
            return;
        }

        // Destruir chart anterior si existe
        if (this.chart) {
            this.chart.destroy();
        }

        const data = this.generateChartData();
        
        // Configuración corregida del gráfico
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: `${this.currentCurrency}/USD`,
                    data: data.prices,
                    borderColor: '#00f3ff',
                    backgroundColor: this.createGradient(ctx),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#00f3ff',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(10, 14, 23, 0.95)',
                        titleColor: '#00f3ff',
                        bodyColor: '#ffffff',
                        borderColor: '#00f3ff',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `Precio: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            callback: function(value) {
                                if (value >= 1000) {
                                    return '$' + (value / 1000).toFixed(0) + 'K';
                                }
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });

        this.updateChartInfo();
        console.log('📊 Gráfico principal renderizado');
    }

    createGradient(ctx) {
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
        gradient.addColorStop(0.7, 'rgba(0, 243, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
        return gradient;
    }

    handleChartHover(event) {
        if (!this.chart || !this.tooltip) return;

        const points = this.chart.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
        
        if (points.length > 0) {
            const firstPoint = points[0];
            const dataset = this.chart.data.datasets[firstPoint.datasetIndex];
            const value = dataset.data[firstPoint.index];
            const label = this.chart.data.labels[firstPoint.index];
            
            // Calcular cambio porcentual desde el primer punto
            const firstPrice = dataset.data[0];
            const change = ((value - firstPrice) / firstPrice * 100).toFixed(2);
            
            // Actualizar tooltip
            this.tooltip.querySelector('.tooltip-price').textContent = `$${value.toLocaleString()}`;
            this.tooltip.querySelector('.tooltip-time').textContent = label;
            this.tooltip.querySelector('.tooltip-change').textContent = `${change >= 0 ? '+' : ''}${change}%`;
            this.tooltip.querySelector('.tooltip-change').className = `tooltip-change ${change >= 0 ? 'positive' : 'negative'}`;
            
            // Posicionar tooltip
            const chartRect = event.target.getBoundingClientRect();
            this.tooltip.style.left = (event.clientX + 10) + 'px';
            this.tooltip.style.top = (event.clientY - 80) + 'px';
            this.tooltip.style.opacity = '1';
        } else {
            this.hideTooltip();
        }
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
        }
    }

    generateChartData() {
        const currencyData = this.getCurrencyData(this.currentCurrency);
        const basePrice = currencyData.price;
        const points = this.getTimeframePoints();
        const labels = [];
        const prices = [];
        
        let currentPrice = basePrice;
        const volatility = this.getVolatilityForTimeframe();
        
        // Simulación más realista con tendencia basada en el cambio porcentual
        const trend = currencyData.change / 100;
        
        for (let i = points - 1; i >= 0; i--) {
            // Simular movimiento de precio más realista con tendencia
            const randomChange = (Math.random() - 0.5) * basePrice * volatility;
            const trendChange = basePrice * trend * (i / points);
            currentPrice += randomChange + trendChange;
            
            // Mantener el precio positivo y dentro de rangos razonables
            currentPrice = Math.max(currentPrice, basePrice * 0.3);
            currentPrice = Math.min(currentPrice, basePrice * 2.0);
            
            prices.push(Number(currentPrice.toFixed(2)));
            labels.push(this.generateTimeLabel(i));
        }
        
        return { labels, prices };
    }

    getTimeframePoints() {
        const points = {
            '1h': 60,
            '4h': 60,
            '1d': 24,
            '1w': 7,
            '1m': 30
        };
        return points[this.currentTimeframe] || 60;
    }

    getVolatilityForTimeframe() {
        const volatility = {
            '1h': 0.008,
            '4h': 0.015,
            '1d': 0.025,
            '1w': 0.05,
            '1m': 0.1
        };
        return volatility[this.currentTimeframe] || 0.01;
    }

    generateTimeLabel(index) {
        const now = new Date();
        const timeframeMs = this.getTimeframeMs();
        const time = new Date(now.getTime() - index * timeframeMs);
        
        if (this.currentTimeframe === '1h' || this.currentTimeframe === '4h') {
            return time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else {
            return time.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        }
    }

    getTimeframeMs() {
        const ms = {
            '1h': 60 * 60 * 1000,
            '4h': 4 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
            '1w': 7 * 24 * 60 * 60 * 1000,
            '1m': 30 * 24 * 60 * 60 * 1000
        };
        return ms[this.currentTimeframe] || 3600000;
    }

    renderAdditionalCharts() {
    setTimeout(() => {
        this.renderDepthChart();
    }, 100);
    
    setTimeout(() => {
        this.renderVolumeChart();
    }, 200);
    
    console.log('📈 Gráficos adicionales renderizados');
}

    renderDepthChart() {
    const ctx = document.getElementById('depthChart');
    if (!ctx) {
        console.log('ℹ️ No se encontró depthChart');
        return;
    }

    if (this.depthChart) {
        this.depthChart.destroy();
    }

    const data = this.generateDepthData();
    
    this.depthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Compras (Bids)',
                    data: data.bids,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Ventas (Asks)',
                    data: data.asks,
                    borderColor: '#ff2e63',
                    backgroundColor: 'rgba(255, 46, 99, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxTicksLimit: 6
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        },
                        maxTicksLimit: 5
                    }
                }
            }
        }
    });
}

    renderVolumeChart() {
    const ctx = document.getElementById('volumeChart');
    if (!ctx) {
        console.log('ℹ️ No se encontró volumeChart');
        return;
    }

    if (this.volumeChart) {
        this.volumeChart.destroy();
    }

    const data = this.generateVolumeData();
    
    this.volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.exchanges,
            datasets: [{
                label: 'Volumen (USD)',
                data: data.volumes,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(0, 243, 255, 0.8)',
                    'rgba(183, 103, 255, 0.8)',
                    'rgba(0, 255, 136, 0.8)'
                ],
                borderColor: [
                    'rgb(102, 126, 234)',
                    'rgb(245, 87, 108)',
                    'rgb(0, 243, 255)',
                    'rgb(183, 103, 255)',
                    'rgb(0, 255, 136)'
                ],
                borderWidth: 1,
                borderRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback: function(value) {
                            if (value >= 1000000000) {
                                return '$' + (value / 1000000000).toFixed(1) + 'B';
                            }
                            return '$' + (value / 1000000).toFixed(0) + 'M';
                        },
                        font: {
                            size: 9
                        }
                    }
                }
            }
        }
    });
}

    generateDepthData() {
        const points = 15;
        const labels = [];
        const bids = [];
        const asks = [];
        
        const basePrice = this.getCurrencyData(this.currentCurrency).price;
        let bidPrice = basePrice * 0.95;
        let askPrice = basePrice * 1.05;
        
        for (let i = 0; i < points; i++) {
            labels.push(`${i + 1}`);
            
            bids.push(bidPrice - (i * basePrice * 0.001));
            asks.push(askPrice + (i * basePrice * 0.001));
        }
        
        return { labels, bids, asks };
    }

    generateVolumeData() {
        const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bybit'];
        const volumes = exchanges.map(() => 
            Math.random() * 2000000000 + 500000000
        );
        
        return { exchanges, volumes };
    }

    startLiveUpdates() {
        // Actualizar último tiempo de actualización
        setInterval(() => {
            const timeElement = document.getElementById('lastUpdate');
            if (timeElement) {
                const now = new Date();
                timeElement.textContent = `Actualizado: ${now.toLocaleTimeString('es-ES')}`;
            }
        }, 30000);

        // Actualizar gráfico principal cada 15 segundos
        setInterval(() => {
            this.updateLivePrice();
        }, 15000);

        // Actualizar gráficos adicionales cada 20 segundos
        setInterval(() => {
            this.updateAdditionalCharts();
        }, 20000);

        console.log('🔄 Actualizaciones en tiempo vivo iniciadas');
    }

    updateAdditionalCharts() {
        // Actualizar gráfico de profundidad
        if (this.depthChart) {
            const newDepthData = this.generateDepthData();
            this.depthChart.data.datasets[0].data = newDepthData.bids;
            this.depthChart.data.datasets[1].data = newDepthData.asks;
            this.depthChart.update('none');
        }

        // Actualizar gráfico de volumen
        if (this.volumeChart) {
            const newVolumeData = this.generateVolumeData();
            this.volumeChart.data.datasets[0].data = newVolumeData.volumes;
            this.volumeChart.update('none');
        }

        // Actualizar indicadores técnicos
        this.updateTechnicalIndicators();
    }

    updateTechnicalIndicators() {
        const currencyData = this.getCurrencyData(this.currentCurrency);
        const baseVolatility = Math.abs(currencyData.change) / 100;
        
        // Generar indicadores más realistas basados en la volatilidad
        const rsi = 30 + (Math.random() * 50);
        const macd = (Math.random() - 0.5) * 200;
        const volumeLevel = baseVolatility > 0.05 ? 'Alto' : (baseVolatility > 0.02 ? 'Medio' : 'Bajo');
        
        const indicators = [
            { element: '.rsi-value', value: rsi.toFixed(1) },
            { element: '.macd-value', value: macd.toFixed(1) },
            { element: '.volume-value', value: volumeLevel }
        ];

        indicators.forEach(indicator => {
            const element = document.querySelector(indicator.element);
            if (element) {
                element.textContent = indicator.value;
                
                // Actualizar estado para RSI
                if (indicator.element === '.rsi-value') {
                    const rsiValue = parseFloat(indicator.value);
                    const statusElement = document.querySelector('.rsi-status');
                    if (statusElement) {
                        if (rsiValue > 70) {
                            statusElement.textContent = 'Sobrecompra';
                            statusElement.className = 'indicator-status negative';
                        } else if (rsiValue < 30) {
                            statusElement.textContent = 'Sobrevendido';
                            statusElement.className = 'indicator-status positive';
                        } else {
                            statusElement.textContent = 'Neutral';
                            statusElement.className = 'indicator-status neutral';
                        }
                    }
                }
            }
        });
    }

    updateLivePrice() {
        if (this.chart && this.chart.data.datasets[0].data.length > 0) {
            const data = this.chart.data;
            const lastPrice = data.datasets[0].data[data.datasets[0].data.length - 1];
            const change = (Math.random() - 0.5) * lastPrice * 0.005;
            const newPrice = Math.max(lastPrice + change, lastPrice * 0.9);
            
            data.datasets[0].data[data.datasets[0].data.length - 1] = Number(newPrice.toFixed(2));
            
            this.chart.update('none');
            this.updateChartInfo();
        }
    }

    updateMarketData() {
    const currencyData = this.getCurrencyData(this.currentCurrency);
    
    // Calcular volumen y market cap basados en datos reales aproximados
    const supplyData = {
        BTC: 19500000, ETH: 120000000, ADA: 45000000000, SOL: 433000000,
        DOGE: 132670000000, XRP: 99900000000, DOT: 1400000000, LTC: 84000000,
        LINK: 1000000000, XLM: 50000000000, XMR: 18300000, XTZ: 900000000,
        EOS: 1000000000, TRX: 100000000000, NEO: 100000000, VET: 86700000000,
        ATOM: 380000000, ALGO: 10000000000, FIL: 500000000, AVAX: 720000000,
        BNB: 157000000, MATIC: 10000000000
    };
    
    const supply = supplyData[this.currentCurrency] || 1000000000;
    const marketCap = currencyData.price * supply;
    
    // Volumen basado en porcentaje del market cap (0.5% - 2%)
    const volumePercentage = (Math.random() * 1.5 + 0.5) / 100;
    const volume = marketCap * volumePercentage;
    
    const volumeElement = document.querySelector('.volume-info strong');
    const marketCapElement = document.querySelector('.volume-info strong:nth-child(2)');
    
    if (volumeElement) {
        if (volume >= 1000000000) {
            volumeElement.textContent = `$${(volume / 1000000000).toFixed(1)}B`;
        } else {
            volumeElement.textContent = `$${(volume / 1000000).toFixed(1)}M`;
        }
    }
    
    if (marketCapElement) {
        if (marketCap >= 1000000000) {
            marketCapElement.textContent = `$${(marketCap / 1000000000).toFixed(1)}B`;
        } else {
            marketCapElement.textContent = `$${(marketCap / 1000000).toFixed(1)}M`;
        }
    }
}

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(10, 14, 23, 0.95);
            border: 1px solid #00f3ff;
            border-radius: 10px;
            padding: 12px 20px;
            color: white;
            font-weight: 600;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 243, 255, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicialización corregida
document.addEventListener('DOMContentLoaded', function() {
    console.log('📈 Inicializando TradingCharts...');
    window.tradingCharts = new TradingCharts();
});

function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
        const user = JSON.parse(userData);
        showUserMenu(user);
    } else {
        showAuthButtons();
    }
}

function showUserMenu(user) {
    document.querySelector('.auth-buttons').innerHTML = `
        <div class="user-menu">
            <button class="user-btn" id="userMenuBtn">
                ${user.name} ▼
            </button>
            <div class="dropdown-menu" id="dropdownMenu">
                <a href="/Fronted/Pages/perfil.html" class="dropdown-item">Ver Perfil</a>
                <button class="dropdown-item" id="logoutBtn">Cerrar Sesión</button>
            </div>
        </div>
    `;
    
    setupUserMenu();
}

function showAuthButtons() {
    document.querySelector('.auth-buttons').innerHTML = `
        <button class="btn btn-outline" id="loginBtn">Iniciar Sesión</button>
        <button class="btn btn-primary" id="registerBtn">Registrarse</button>
    `;
    
    setupAuthButtons();
}
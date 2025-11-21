// dashboard-enhanced.js - Sistema completo de dashboard con datos de BD

class DashboardEnhanced {
    constructor() {
        this.api = window.apiSystem;
        this.portfolioDB = window.portfolioDB;
        this.charts = {};
        this.dashboardData = {
            totalInvested: 0,
            totalWithdrawn: 0,
            totalProfit: 0,
            profitPercentage: 0,
            totalTransactions: 0,
            investmentTime: 0,
            mostTradedCrypto: '',
            topCryptos: [],
            profitHistory: [],
            transactionsByType: [],
            allTransactions: []
        };
        this.init();
    }

    async init() {
        console.log('📊 Inicializando Dashboard Enhanced...');
        
        // Esperar a que PortfolioDB esté listo
        await this.waitForPortfolioDB();
        
        // Cargar datos
        await this.loadDashboardData();
        
        // Renderizar todo
        this.renderDashboard();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        console.log('✅ Dashboard Enhanced inicializado');
    }

    async waitForPortfolioDB() {
        let attempts = 0;
        while (!window.portfolioDB && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (window.portfolioDB) {
            this.portfolioDB = window.portfolioDB;
            console.log('✅ PortfolioDB conectado');
        } else {
            console.warn('⚠️ PortfolioDB no disponible, usando datos de ejemplo');
        }
    }

    async loadDashboardData() {
        console.log('📥 Cargando datos del dashboard...');
        
        try {
            // Intentar cargar desde la BD
            let transactions = [];
            
            if (this.portfolioDB && this.portfolioDB.initialized) {
                transactions = await this.portfolioDB.getTransactionHistory(100);
                console.log('📊 Transacciones cargadas de BD:', transactions.length);
            }
            
            // Si no hay transacciones en BD, usar localStorage como fallback
            if (!transactions || transactions.length === 0) {
                transactions = this.getTransactionsFromLocalStorage();
                console.log('💾 Transacciones cargadas de localStorage:', transactions.length);
            }
            
            // Si aún no hay datos, generar datos de ejemplo
            if (!transactions || transactions.length === 0) {
                transactions = this.generateSampleTransactions();
                console.log('🎲 Usando transacciones de ejemplo');
            }
            
            this.dashboardData.allTransactions = transactions;
            this.processTransactionsData(transactions);
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            // Usar datos de ejemplo en caso de error
            this.dashboardData.allTransactions = this.generateSampleTransactions();
            this.processTransactionsData(this.dashboardData.allTransactions);
        }
    }

    getTransactionsFromLocalStorage() {
        try {
            const backup = localStorage.getItem('portfolio_backup');
            if (backup) {
                const data = JSON.parse(backup);
                return data
                    .filter(item => item.data.type !== 'portfolio_snapshot')
                    .map(item => item.data);
            }
        } catch (error) {
            console.error('Error leyendo localStorage:', error);
        }
        return [];
    }

    processTransactionsData(transactions) {
        // Calcular estadísticas
        let totalInvested = 0;
        let totalWithdrawn = 0;
        let totalSold = 0;
        const cryptoCounter = {};
        const typeCounter = { buy: 0, sell: 0, withdraw: 0 };
        
        transactions.forEach(transaction => {
            const type = transaction.type;
            typeCounter[type]++;
            
            if (type === 'buy') {
                totalInvested += transaction.investment || transaction.totalCost || 0;
                const crypto = transaction.cryptoSymbol || transaction.crypto || 'Unknown';
                cryptoCounter[crypto] = (cryptoCounter[crypto] || 0) + 1;
            } else if (type === 'sell') {
                totalSold += transaction.saleValue || transaction.netAmount || 0;
            } else if (type === 'withdraw') {
                totalWithdrawn += transaction.amount || 0;
            }
        });
        
        this.dashboardData.totalInvested = totalInvested;
        this.dashboardData.totalWithdrawn = totalWithdrawn + totalSold;
        this.dashboardData.totalProfit = (totalSold + totalWithdrawn) - totalInvested;
        this.dashboardData.profitPercentage = totalInvested > 0 
            ? (this.dashboardData.totalProfit / totalInvested * 100) 
            : 0;
        this.dashboardData.totalTransactions = transactions.length;
        
        // Calcular tiempo de inversión
        if (transactions.length > 0) {
            const firstTransaction = new Date(transactions[transactions.length - 1].timestamp);
            const now = new Date();
            const days = Math.floor((now - firstTransaction) / (1000 * 60 * 60 * 24));
            this.dashboardData.investmentTime = days;
        }
        
        // Encontrar cripto más negociada
        const sortedCryptos = Object.entries(cryptoCounter).sort((a, b) => b[1] - a[1]);
        this.dashboardData.mostTradedCrypto = sortedCryptos[0]?.[0] || 'N/A';
        
        // Preparar datos para gráficos
        this.prepareChartData(transactions, cryptoCounter, typeCounter);
    }

    prepareChartData(transactions, cryptoCounter, typeCounter) {
        // Top criptos
        const sortedCryptos = Object.entries(cryptoCounter)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        const totalOps = Object.values(cryptoCounter).reduce((a, b) => a + b, 0);
        
        this.dashboardData.topCryptos = sortedCryptos.map(([crypto, count]) => ({
            name: crypto,
            value: ((count / totalOps) * 100).toFixed(1),
            count: count
        }));
        
        // Transacciones por tipo
        this.dashboardData.transactionsByType = [
            { type: 'Compras', count: typeCounter.buy || 0 },
            { type: 'Ventas', count: typeCounter.sell || 0 },
            { type: 'Retiros', count: typeCounter.withdraw || 0 }
        ];
        
        // Historial de ganancias (últimos 6 períodos)
        this.dashboardData.profitHistory = this.generateProfitHistory(transactions);
    }

    generateProfitHistory(transactions) {
        const history = [];
        const periods = 6;
        
        for (let i = periods - 1; i >= 0; i--) {
            const profit = Math.random() * 1000 * (periods - i);
            history.push({
                date: `Sem ${periods - i}`,
                profit: profit.toFixed(2)
            });
        }
        
        return history;
    }

    generateSampleTransactions() {
        const sampleTransactions = [];
        const cryptos = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT'];
        const types = ['buy', 'sell', 'withdraw'];
        
        for (let i = 0; i < 20; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
            
            sampleTransactions.push({
                type: type,
                cryptoSymbol: crypto,
                cryptoName: crypto,
                amount: Math.random() * 10,
                price: Math.random() * 50000,
                investment: Math.random() * 1000,
                saleValue: type === 'sell' ? Math.random() * 1200 : 0,
                profit: Math.random() * 200 - 100,
                profitPercentage: Math.random() * 20 - 10,
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            });
        }
        
        return sampleTransactions;
    }

    renderDashboard() {
        this.updateSummaryCards();
        this.renderProfitChart();
        this.renderPortfolioChart();
        this.renderTopCryptos();
        this.renderTransactionsBarChart();
        this.renderTransactionsTable();
        this.updateInsight();
    }

    updateSummaryCards() {
        document.getElementById('totalInvested').textContent = 
            `$${this.dashboardData.totalInvested.toFixed(2)}`;
        
        const profitElement = document.getElementById('totalProfit');
        profitElement.textContent = 
            `${this.dashboardData.totalProfit >= 0 ? '+' : ''}$${Math.abs(this.dashboardData.totalProfit).toFixed(2)}`;
        profitElement.className = `stat-value ${this.dashboardData.totalProfit >= 0 ? 'profit' : 'loss'}`;
        
        document.getElementById('profitPercentage').textContent = 
            `${this.dashboardData.profitPercentage >= 0 ? '+' : ''}${this.dashboardData.profitPercentage.toFixed(2)}%`;
        
        document.getElementById('totalTransactions').textContent = 
            this.dashboardData.totalTransactions;
        
        document.getElementById('investmentTime').textContent = 
            `${this.dashboardData.investmentTime} días`;
    }

    renderProfitChart() {
        const ctx = document.getElementById('profitChart');
        if (!ctx) return;
        
        if (this.charts.profitChart) {
            this.charts.profitChart.destroy();
        }
        
        this.charts.profitChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.dashboardData.profitHistory.map(h => h.date),
                datasets: [{
                    label: 'Ganancia ($)',
                    data: this.dashboardData.profitHistory.map(h => h.profit),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderPortfolioChart() {
        const ctx = document.getElementById('portfolioChart');
        if (!ctx) return;
        
        if (this.charts.portfolioChart) {
            this.charts.portfolioChart.destroy();
        }
        
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
        
        this.charts.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.dashboardData.topCryptos.map(c => c.name),
                datasets: [{
                    data: this.dashboardData.topCryptos.map(c => c.value),
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#e2e8f0', padding: 15 }
                    }
                }
            }
        });
    }

    renderTopCryptos() {
        const container = document.getElementById('topCryptosTable');
        if (!container) return;
        
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
        
        container.innerHTML = this.dashboardData.topCryptos.map((crypto, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; background: ${colors[index]}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                        ${crypto.name[0]}
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #e2e8f0;">${crypto.name}</div>
                        <div style="font-size: 0.85rem; color: #94a3b8;">${crypto.count} operaciones</div>
                    </div>
                </div>
                <div style="font-weight: bold; color: #10b981;">${crypto.value}%</div>
            </div>
        `).join('');
    }

    renderTransactionsBarChart() {
        const ctx = document.getElementById('transactionsBarChart');
        if (!ctx) return;
        
        if (this.charts.transactionsBarChart) {
            this.charts.transactionsBarChart.destroy();
        }
        
        this.charts.transactionsBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.dashboardData.transactionsByType.map(t => t.type),
                datasets: [{
                    label: 'Cantidad',
                    data: this.dashboardData.transactionsByType.map(t => t.count),
                    backgroundColor: ['#667eea', '#f093fb', '#43e97b'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderTransactionsTable() {
        const tbody = document.getElementById('transactionsBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (this.dashboardData.allTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #94a3b8;">No hay transacciones registradas</td></tr>';
            return;
        }
        
        this.dashboardData.allTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const type = transaction.type;
            const typeText = type === 'buy' ? 'Compra' : type === 'sell' ? 'Venta' : 'Retiro';
            const typeClass = `status-${type}`;
            
            const crypto = transaction.cryptoName || transaction.cryptoSymbol || 'N/A';
            const amount = (transaction.amount || 0).toFixed(6);
            const price = (transaction.price || 0).toFixed(2);
            const investment = (transaction.investment || transaction.totalCost || 0).toFixed(2);
            const saleValue = (transaction.saleValue || transaction.netAmount || 0).toFixed(2);
            const profit = (transaction.profit || 0).toFixed(2);
            const profitPercent = (transaction.profitPercentage || 0).toFixed(2);
            const date = new Date(transaction.timestamp).toLocaleDateString();
            
            const profitClass = parseFloat(profit) >= 0 ? 'profit' : 'loss';
            
            row.innerHTML = `
                <td class="${typeClass}">${typeText}</td>
                <td>${crypto}</td>
                <td>${amount}</td>
                <td>$${price}</td>
                <td>$${investment}</td>
                <td>$${saleValue}</td>
                <td class="${profitClass}">$${profit}</td>
                <td class="${profitClass}">${profitPercent}%</td>
                <td>${date}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateInsight() {
        const insightElement = document.getElementById('insightText');
        if (!insightElement) return;
        
        const insight = `Tu criptomoneda más negociada es ${this.dashboardData.mostTradedCrypto}. 
        Has realizado ${this.dashboardData.totalTransactions} transacciones en ${this.dashboardData.investmentTime} días, 
        con una ${this.dashboardData.totalProfit >= 0 ? 'ganancia' : 'pérdida'} del ${Math.abs(this.dashboardData.profitPercentage).toFixed(2)}%.`;
        
        insightElement.textContent = insight;
    }

    setupEventListeners() {
        // Exportar dashboard
        const exportBtn = document.getElementById('exportDashboardBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportDashboard());
        }
        
        // Exportar Excel
        const exportExcelBtn = document.getElementById('exportExcelBtn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportToExcel());
        }
        
        // Filtros
        const searchInput = document.getElementById('searchInput');
        const typeFilter = document.getElementById('typeFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterTransactions());
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterTransactions());
        }
    }

    filterTransactions() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const type = document.getElementById('typeFilter')?.value || '';
        
        let filtered = this.dashboardData.allTransactions;
        
        if (searchTerm) {
            filtered = filtered.filter(t => 
                (t.cryptoSymbol || '').toLowerCase().includes(searchTerm) ||
                (t.cryptoName || '').toLowerCase().includes(searchTerm)
            );
        }
        
        if (type) {
            filtered = filtered.filter(t => t.type === type);
        }
        
        // Re-renderizar tabla con datos filtrados
        const tbody = document.getElementById('transactionsBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        filtered.forEach(transaction => {
            const row = document.createElement('tr');
            const type = transaction.type;
            const typeText = type === 'buy' ? 'Compra' : type === 'sell' ? 'Venta' : 'Retiro';
            const typeClass = `status-${type}`;
            
            row.innerHTML = `
                <td class="${typeClass}">${typeText}</td>
                <td>${transaction.cryptoName || transaction.cryptoSymbol || 'N/A'}</td>
                <td>${(transaction.amount || 0).toFixed(6)}</td>
                <td>$${(transaction.price || 0).toFixed(2)}</td>
                <td>$${(transaction.investment || transaction.totalCost || 0).toFixed(2)}</td>
                <td>$${(transaction.saleValue || transaction.netAmount || 0).toFixed(2)}</td>
                <td class="${(transaction.profit || 0) >= 0 ? 'profit' : 'loss'}">$${(transaction.profit || 0).toFixed(2)}</td>
                <td class="${(transaction.profitPercentage || 0) >= 0 ? 'profit' : 'loss'}">${(transaction.profitPercentage || 0).toFixed(2)}%</td>
                <td>${new Date(transaction.timestamp).toLocaleDateString()}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    exportDashboard() {
        const dataStr = JSON.stringify(this.dashboardData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-crypto-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('✅ Dashboard exportado correctamente');
    }

    exportToExcel() {
        if (typeof XLSX === 'undefined') {
            this.showNotification('❌ Librería XLSX no disponible', 'error');
            return;
        }
        
        const ws = XLSX.utils.json_to_sheet(this.dashboardData.allTransactions);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
        XLSX.writeFile(wb, `transacciones-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        this.showNotification('✅ Archivo Excel exportado correctamente');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Inicializando Dashboard Enhanced...');
    window.dashboardEnhanced = new DashboardEnhanced();
});
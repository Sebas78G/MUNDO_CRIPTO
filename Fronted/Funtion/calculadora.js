// calculator-system.js - CALCULADORA SIMPLIFICADA
class InvestmentCalculator {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧮 Inicializando calculadora...');
        this.setupEventListeners();
        console.log('✅ Calculadora lista');
    }

    setupEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculate());
        }
    }

    calculate() {
        console.log('Calculando...');
        // Lógica simple de cálculo aquí
        alert('Calculadora funcionando - lógica por implementar');
    }
}
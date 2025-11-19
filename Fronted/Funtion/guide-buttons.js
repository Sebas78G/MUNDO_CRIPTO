// guide-buttons.js - Sistema de botones de guías educativas

class GuideButtonsSystem {
    constructor() {
        this.init();
    }

    init() {
        console.log('📚 Inicializando sistema de botones de guías...');
        this.setupGuideButtons();
        this.setupGuideModals();
        console.log('✅ Sistema de botones de guías listo');
    }

    setupGuideButtons() {
        console.log('🔘 Configurando botones de guías...');
        
        // Botones de las guías educativas
        const guideButtons = document.querySelectorAll('[data-guide]');
        
        guideButtons.forEach(button => {
            const guideId = button.getAttribute('data-guide');
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`👆 Click en guía: ${guideId}`);
                this.openGuideModal(guideId);
            });

            // Agregar estilos visuales
            button.style.cursor = 'pointer';
            button.classList.add('guide-button');
            
            console.log(`✅ Botón configurado: ${guideId}`);
        });

        console.log(`🎯 Total botones de guías configurados: ${guideButtons.length}`);
    }

    setupGuideModals() {
        console.log('📖 Configurando modales de guías...');
        
        // Cerrar modales con botón X
        document.querySelectorAll('.guide-modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.guide-modal');
                this.closeGuideModal(modal.id);
            });
        });

        // Cerrar modal al hacer click fuera
        document.querySelectorAll('.guide-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeGuideModal(modal.id);
                }
            });
        });
    }

    openGuideModal(guideId) {
        console.log(`📱 Abriendo guía: ${guideId}`);
        this.closeAllGuideModals();
        
        const modal = document.getElementById(guideId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Animación de entrada
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.transition = 'opacity 0.3s ease';
            }, 10);
            
            console.log(`✅ Guía abierta: ${guideId}`);
        } else {
            console.error(`❌ Modal de guía no encontrado: ${guideId}`);
            this.showGuideMessage(`❌ Guía "${this.getGuideName(guideId)}" no disponible`, 'error');
        }
    }

    closeGuideModal(guideId) {
        const modal = document.getElementById(guideId);
        if (modal) {
            // Animación de salida
            modal.style.opacity = '0';
            
            setTimeout(() => {
                modal.style.display = 'none';
                
                // Restaurar scroll si no hay otros modales abiertos
                if (!document.querySelector('.modal[style*="display: block"], .guide-modal[style*="display: block"]')) {
                    document.body.style.overflow = '';
                }
            }, 300);
            
            console.log(`📕 Guía cerrada: ${guideId}`);
        }
    }

    closeAllGuideModals() {
        document.querySelectorAll('.guide-modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Solo restaurar scroll si no hay modales de auth abiertos
        if (!document.querySelector('.modal[style*="display: block"]')) {
            document.body.style.overflow = '';
        }
    }

    getGuideName(guideId) {
        const guideNames = {
            'blockchainModal': '¿Qué es Blockchain?',
            'primerosPasosModal': 'Primeros Pasos en Cripto',
            'seguridadModal': 'Seguridad y Wallets', 
            'tradingModal': 'Trading Básico'
        };
        
        return guideNames[guideId] || 'Guía Educativa';
    }

    showGuideMessage(message, type = 'info') {
        // Remover mensajes existentes
        const existingMessage = document.querySelector('.guide-message');
        if (existingMessage) existingMessage.remove();

        // Crear nuevo mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `guide-message guide-${type}`;
        messageEl.innerHTML = `
            <div class="guide-message-content">
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(messageEl);

        // Animación de entrada
        setTimeout(() => messageEl.classList.add('show'), 10);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) messageEl.remove();
            }, 300);
        }, 3000);
    }
}

// Auto-inicialización cuando se carga el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.guideButtonsSystem = new GuideButtonsSystem();
    });
} else {
    window.guideButtonsSystem = new GuideButtonsSystem();
}
// education-system.js - Sistema educativo corregido
class EducationSystem {
    constructor() {
        this.initialized = false;
        this.init();
    }

    async init() {
        if (this.initialized) {
            console.log('📚 EducationSystem ya estaba inicializado');
            return;
        }

        console.log('📚 Inicializando sistema educativo...');
        this.setupGuideModals();
        this.setupLevelTabs();
        this.initialized = true;
        console.log('✅ Sistema educativo listo');
    }

    setupGuideModals() {
        console.log('🔧 Configurando modales educativos...');
        
        // Delegación de eventos para los botones "Aprender"
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('learn-btn')) {
                e.preventDefault();
                const guideId = e.target.getAttribute('data-guide-id');
                console.log('👆 Click en guía:', guideId);
                this.openGuideModal(guideId);
            }
        });

        // Cerrar modales con botón X
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                e.preventDefault();
                this.closeAllGuideModals();
            }
        });

        // Cerrar modal al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllGuideModals();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllGuideModals();
            }
        });

        // Cerrar con botones de acción
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('guide-modal-close')) {
                e.preventDefault();
                this.closeAllGuideModals();
            }
        });
    }

    setupLevelTabs() {
        console.log('🔧 Configurando pestañas de niveles...');
        
        const levelTabs = document.querySelectorAll('.level-tab');
        const levelContents = document.querySelectorAll('.level-content');
        
        levelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetLevel = tab.dataset.level;
                
                // Actualizar pestañas
                levelTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Actualizar contenidos
                levelContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetLevel}-content`) {
                        content.classList.add('active');
                    }
                });
                
                console.log(`📚 Cambiando a nivel: ${targetLevel}`);
            });
        });
    }

    openGuideModal(guideId) {
        console.log(`📖 Abriendo guía: ${guideId}`);
        
        // Primero cerrar cualquier modal abierto
        this.closeAllGuideModals();
        
        // Buscar el modal correspondiente
        const modal = document.getElementById(`${guideId}-modal`);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log(`✅ Modal abierto: ${guideId}`);
        } else {
            console.error(`❌ Modal no encontrado: ${guideId}-modal`);
            this.showTemporaryMessage(`Guía "${guideId}" no disponible`, 'error');
        }
    }

    closeAllGuideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    showTemporaryMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `guide-message guide-${type}`;
        messageEl.innerHTML = `
            <div class="guide-message-content">
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(messageEl);

        setTimeout(() => messageEl.classList.add('show'), 10);

        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) messageEl.remove();
            }, 300);
        }, 3000);
    }
}

// AUTO-INICIALIZACIÓN (igual que los otros sistemas)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📚 Inicializando EducationSystem...');
        window.educationSystem = new EducationSystem();
    });
} else {
    console.log('📚 Inicializando EducationSystem (DOM ya listo)...');
    window.educationSystem = new EducationSystem();
}
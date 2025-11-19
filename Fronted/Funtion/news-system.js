// news-system.js - Sistema de noticias en tiempo real con modales

class NewsSystem {
    constructor() {
        this.newsData = [];
        this.init();
    }

    async init() {
        console.log('📰 Inicializando sistema de noticias...');
        await this.loadNews();
        this.setupNewsModals();
        this.setupNewsRefresh();
        console.log('✅ Sistema de noticias listo');
    }

    async loadNews() {
        try {
            this.showLoadingState();
            
            const news = await this.fetchNews();
            this.newsData = news;
            this.updateNewsUI();
            
            console.log(`✅ ${news.length} noticias cargadas`);
            
        } catch (error) {
            console.error('❌ Error cargando noticias:', error);
            this.showErrorState();
            // Cargar noticias de ejemplo si falla la API
            this.newsData = this.getFallbackNews();
            this.updateNewsUI();
        }
    }

    async fetchNews() {
        try {
            const apiUrl = 'https://cryptopanic.com/api/v1/posts/?auth_token=demo&public=true';
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processNewsData(data.results || []);
            
        } catch (error) {
            console.warn('⚠️ Error con API externa, usando noticias de ejemplo');
            throw error; // Propagar el error para que se maneje en loadNews
        }
    }

    processNewsData(apiNews) {
        return apiNews.slice(0, 6).map((newsItem, index) => ({
            id: newsItem.id || Date.now() + index,
            title: this.cleanTitle(newsItem.title),
            description: this.cleanDescription(newsItem.metadata?.description || newsItem.title),
            full_content: this.generateFullContent(newsItem),
            url: newsItem.url,
            source: newsItem.source?.title || 'CryptoPanic',
            published_at: newsItem.published_at,
            currencies: newsItem.currencies || [],
            image: this.getNewsImage(newsItem, index),
            category: this.getNewsCategory(newsItem),
            author: this.getAuthor(newsItem),
            read_time: this.calculateReadTime(newsItem)
        }));
    }

    getFallbackNews() {
        return [
            {
                id: 1,
                title: "Bitcoin supera los $45,000 impulsado por adopción institucional",
                description: "El precio de Bitcoin continúa su tendencia alcista gracias a la creciente adopción por parte de grandes instituciones financieras.",
                full_content: `El mercado de criptomonedas vive un momento histórico con Bitcoin liderando una impresionante rally alcista que ha llevado a la criptomoneda a superar la barrera psicológica de los $45,000. Este movimiento se produce en un contexto de creciente adopción institucional y un renovado interés por parte de inversores minoristas.

**Factores Clave del Crecimiento**

- **Adopción Institucional:** Grandes fondos de inversión y empresas públicas continúan añadiendo Bitcoin a sus balances
- **Contexto Macro:** La situación económica global impulsa la demanda de activos refugio alternativos
- **Desarrollo Técnico:** La red Bitcoin continúa fortaleciéndose con mejoras en la capa 2

**Perspectivas de Mercado**

Los analistas sugieren que si Bitcoin logra mantener este nivel, podría apuntar hacia los $50,000 en el corto plazo. Sin embargo, recomiendan cautela dado la volatilidad característica del mercado.`,
                source: "CryptoNews",
                published_at: new Date().toISOString(),
                image: this.getFallbackImage(0),
                category: "bitcoin",
                author: "María Rodríguez",
                read_time: "4 min"
            },
            {
                id: 2,
                title: "Ethereum completa exitosamente actualización de Londres",
                description: "La implementación de EIP-1559 mejora la experiencia de usuario y introduce quema de fees en la red Ethereum.",
                full_content: `La red Ethereum ha dado un paso crucial en su evolución con la exitosa implementación de la actualización Londres, marcando un hito significativo en el camino hacia Ethereum 2.0.

**EIP-1559: Cambio Revolucionario**

La propuesta de mejora EIP-1559 introduce cambios fundamentales en el mecanismo de tarifas de la red:

- **Tarifas Predecibles:** Los usuarios ahora pueden estimar mejor el costo de sus transacciones
- **Quema de ETH:** Una porción de las tarifas de transacción es ahora quemada
- **Mejora en Experiencia:** La interfaz de usuario para el manejo de gas fees se ha simplificado

**Impacto en el Ecosistema**

Esta actualización no solo mejora la experiencia del usuario final, sino que también sienta las bases para la futura transición a Proof-of-Stake.`,
                source: "DeFi Pulse",
                published_at: new Date().toISOString(),
                image: this.getFallbackImage(1),
                category: "ethereum",
                author: "Carlos Mendoza",
                read_time: "3 min"
            },
            {
                id: 3,
                title: "El Salvador anuncia planes para nueva ciudad Bitcoin",
                description: "El gobierno revela ambiciosos planes para desarrollar una ciudad financiada completamente con Bitcoin.",
                full_content: `En un movimiento audaz que consolida su posición como pionero en la adopción de criptomonedas, El Salvador ha revelado planes para construir "Bitcoin City", una metrópolis completamente financiada con Bitcoin y energizada por energía volcánica.

**Características de Bitcoin City**

- **Ubicación Estratégica:** La ciudad se construirá en la región oriental del país
- **Financiamiento Innovador:** El proyecto será financiado mediante bonos respaldados en Bitcoin
- **Zona Económica Especial:** Ofrecerá beneficios fiscales significativos

**Implicaciones Globales**

Este proyecto podría establecer un precedente para otros países en desarrollo que buscan alternativas innovadoras de financiamiento y desarrollo.`,
                source: "Bitcoin Magazine",
                published_at: new Date().toISOString(),
                image: this.getFallbackImage(2),
                category: "adoption",
                author: "Ana López",
                read_time: "5 min"
            },
            {
                id: 4,
                title: "NFTs revolucionan el mercado del arte digital",
                description: "Las ventas de NFTs alcanzan nuevos récords mientras más artistas adoptan la tecnología blockchain.",
                full_content: `El mercado de NFTs (Tokens No Fungibles) está experimentando un crecimiento exponencial, transformando radicalmente la forma en que concebimos y comercializamos el arte digital.

**Tendencias del Mercado NFT**

- **Récords de Ventas:** Obras de arte digital han alcanzado precios millonarios
- **Diversificación:** Los NFTs han expandido su alcance más allá del arte
- **Artistas Tradicionales:** Reconocidos artistas están explorando los NFTs como nuevo medio

**Impacto Cultural**

Esta revolución está redefiniendo conceptos fundamentales como la propiedad digital, la autenticidad y el valor en la era digital.`,
                source: "NFT Now",
                published_at: new Date().toISOString(),
                image: this.getFallbackImage(3),
                category: "nft",
                author: "Laura Martínez",
                read_time: "4 min"
            },
            {
                id: 5,
                title: "Reguladores globales discuten marco para criptoactivos",
                description: "Representantes de diferentes países se reúnen para establecer estándares regulatorios comunes.",
                full_content: `En un esfuerzo coordinado para abordar el creciente mercado de criptoactivos, reguladores financieros de las principales economías mundiales se han reunido para discutir la creación de un marco regulatorio global.

**Temas Principales de Discusión**

- **Protección al Consumidor:** Establecer estándares mínimos para la protección de inversores
- **Prevención de Lavado:** Desarrollar protocolos efectivos contra el lavado de dinero
- **Estabilidad Financiera:** Evaluar el impacto potencial en la estabilidad del sistema financiero

**Enfoques por Región**

- **Unión Europea:** Avanzando con MiCA (Markets in Crypto-Assets)
- **Estados Unidos:** Enfoque fragmentado con múltiples agencias
- **Asia:** Enfoques diversos desde adopción hasta restricciones`,
                source: "Financial Times",
                published_at: new Date().toISOString(),
                image: this.getFallbackImage(4),
                category: "regulation",
                author: "Roberto Silva",
                read_time: "6 min"
            },
            {
                id: 6,
                title: "DeFi supera los $100B en valor total bloqueado",
                description: "Las finanzas descentralizadas continúan su crecimiento exponencial a nivel global.",
                full_content: `El ecosistema de Finanzas Descentralizadas (DeFi) ha alcanzado un hito histórico al superar los $100 mil millones en valor total bloqueado (TVL), demostrando el rápido crecimiento y adopción de estas plataformas.

**Factores del Crecimiento**

- **Innovación Continua:** Nuevos protocolos y productos financieros
- **Rendimientos Atractivos:** Tasas de interés atractivas en protocols de lending
- **Mejora en UX:** Interfaces más intuitivas para usuarios no técnicos

**Protocolos Líderes**

- **Aave y Compound:** Dominan el mercado de lending descentralizado
- **Uniswap y SushiSwap:** Liderazgo en exchanges descentralizados
- **Curve Finance:** Especializado en stablecoins

**Desafíos y Oportunidades**

El ecosistema enfrenta desafíos en seguridad, escalabilidad y experiencia de usuario que representan oportunidades para futuras innovaciones.`,
                source: "DeFi Llama",
                published_at: new Date().toISOString(),
                image: this.getFallbackImage(5),
                category: "defi",
                author: "Diego Ramírez",
                read_time: "5 min"
            }
        ];
    }

    updateNewsUI() {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) {
            console.error('❌ No se encontró el contenedor .news-grid');
            return;
        }

        console.log('🔄 Actualizando UI de noticias...');
        
        // Limpiar grid existente
        newsGrid.innerHTML = '';

        // Crear tarjetas de noticias
        this.newsData.forEach((newsItem) => {
            const newsCard = this.createNewsCard(newsItem);
            newsGrid.appendChild(newsCard);
        });

        console.log(`✅ UI actualizada con ${this.newsData.length} noticias`);
    }

    createNewsCard(newsItem) {
        const card = document.createElement('article');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-image">
                ${newsItem.image}
                <span class="news-tag ${newsItem.category}">
                    ${this.getCategoryIcon(newsItem.category)} ${this.getCategoryName(newsItem.category)}
                </span>
            </div>
            <div class="news-content">
                <h3>${newsItem.title}</h3>
                <p>${newsItem.description}</p>
                <div class="news-meta">
                    <span class="date">${this.formatDate(newsItem.published_at)}</span>
                    <span class="author">Por ${newsItem.author}</span>
                </div>
                <button class="read-more" data-news-id="${newsItem.id}">
                    Leer más ↓
                </button>
            </div>
        `;

        return card;
    }

    setupNewsModalScroll(modal) {
    const modalBody = modal.querySelector('.news-modal-body');
    if (modalBody) {
        modalBody.addEventListener('scroll', () => {
            if (modalBody.scrollTop > 10) {
                modalBody.classList.add('scrolled');
            } else {
                modalBody.classList.remove('scrolled');
            }
        });
    }
}

    setupNewsModals() {
        console.log('🔧 Configurando eventos de modales...');
        
        // Usar delegación de eventos para los botones "Leer más"
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more')) {
                e.preventDefault();
                const newsId = e.target.getAttribute('data-news-id');
                console.log('👆 Click en Leer más:', newsId);
                this.openNewsModal(newsId);
            }
        });

        // También manejar clics en el botón cerrar de los modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('news-modal-close')) {
                e.preventDefault();
                const modal = e.target.closest('.news-modal');
                if (modal) {
                    this.closeNewsModal(modal.id);
                }
            }
        });

        // Cerrar modal al hacer click fuera del contenido
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('news-modal')) {
                this.closeNewsModal(e.target.id);
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllNewsModals();
            }
        });
    }

    openNewsModal(newsId) {
        console.log(`📖 Abriendo noticia completa: ${newsId}`);
        
        const newsItem = this.newsData.find(item => item.id == newsId);
        if (!newsItem) {
            console.error('❌ Noticia no encontrada:', newsId);
            return;
        }

        this.closeAllNewsModals();
        
        // Crear el modal
        const modal = this.createNewsModal(newsItem);
        document.body.appendChild(modal);

        // Mostrar el modal con animación
        setTimeout(() => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }, 10);
        
        console.log(`✅ Modal creado para: "${newsItem.title}"`);
    }

    createNewsModal(newsItem) {
    const modal = document.createElement('div');
    modal.id = `newsModal-${newsItem.id}`;
    modal.className = 'modal news-modal';
    modal.style.display = 'none';
    this.setupNewsModalScroll(modal);
    
    modal.innerHTML = `
        <div class="modal-content news-modal-content">
            <span class="close">&times;</span>
            
            <div class="news-modal-header" style="background: ${this.getCategoryColor(newsItem.category)}">
                <div class="news-modal-top">
                    <span class="news-modal-category">
                        ${this.getCategoryIcon(newsItem.category)} ${this.getCategoryName(newsItem.category)}
                    </span>
                    <h2>${newsItem.title}</h2>
                    <div class="news-modal-info">
                        <span class="news-modal-source">📰 ${newsItem.source}</span>
                        <span class="news-modal-author">✍️ ${newsItem.author}</span>
                        <span class="news-modal-time">⏱️ ${newsItem.read_time} de lectura</span>
                        <span class="news-modal-date">📅 ${this.formatDetailedDate(newsItem.published_at)}</span>
                    </div>
                </div>
                <div class="news-modal-image">
                    ${newsItem.image.replace('image-placeholder', 'image-placeholder news-modal-image-placeholder')}
                </div>
            </div>

            <div class="news-modal-body">
                <div class="news-modal-content-text">
                    ${this.formatNewsContent(newsItem.full_content)}
                </div>
                
                <div class="news-modal-actions">
                    ${newsItem.url && newsItem.url !== '#' ? 
                        `<a href="${newsItem.url}" class="btn btn-primary" target="_blank" rel="noopener">
                            📖 Leer noticia original
                        </a>` : ''
                    }
                    <button class="btn btn-outline news-modal-close">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    return modal;
}

    closeNewsModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            // Solo restaurar scroll si no hay otros modales abiertos
            if (!document.querySelector('.modal[style*="display: block"]')) {
                document.body.style.overflow = '';
            }
            console.log('📕 Modal cerrado:', modalId);
        }
    }

    closeAllNewsModals() {
        document.querySelectorAll('.news-modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    formatNewsContent(content) {
    if (!content) return '<p>Contenido no disponible.</p>';
    
    // Convertir saltos de línea en párrafos
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    let html = '';
    
    paragraphs.forEach(paragraph => {
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
            // Es un título
            const title = paragraph.replace(/\*\*/g, '').trim();
            html += `<h3 class="content-title">${title}</h3>`;
        } else if (paragraph.includes('**')) {
            // Tiene texto en negrita
            let formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedParagraph = formattedParagraph.replace(/\n/g, '<br>');
            html += `<p class="content-paragraph">${formattedParagraph}</p>`;
        } else if (paragraph.startsWith('- ')) {
            // Es una lista
            const listItems = paragraph.split('\n').filter(item => item.startsWith('- '));
            html += '<ul class="content-list">';
            listItems.forEach(item => {
                const listItem = item.replace('- ', '').trim();
                html += `<li class="content-list-item">${listItem}</li>`;
            });
            html += '</ul>';
        } else {
            // Párrafo normal
            html += `<p class="content-paragraph">${paragraph.replace(/\n/g, '<br>')}</p>`;
        }
    });
    
    return html || '<p>Contenido no disponible.</p>';
}

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    }

    formatDetailedDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    }

    generateFullContent(newsItem) {
        // Contenido extendido basado en la noticia
        return `Esta noticia representa un desarrollo significativo en el ecosistema cripto. Los expertos coinciden en que este tipo de avances contribuyen a la maduración del mercado y a una mayor adopción por parte del público general.

**Análisis del Impacto**

El anuncio ha generado reacciones positivas en la comunidad, con muchos analistas revisando sus proyecciones a la luz de estos nuevos desarrollos. Se espera que este movimiento influya en las tendencias del mercado en las próximas semanas.

**Contexto del Mercado**

- Creciente interés institucional en criptoactivos
- Evolución regulatoria en diferentes jurisdicciones
- Desarrollo tecnológico continuo en blockchain

**Perspectivas Futuras**

Mientras el ecosistema continúa evolucionando, eventos como este refuerzan la importancia de mantenerse informado sobre los últimos desarrollos en el espacio blockchain y cripto.`;
    }

    getAuthor(newsItem) {
        const authors = ['María Rodríguez', 'Carlos Mendoza', 'Ana López', 'Laura Martínez', 'Roberto Silva', 'Diego Ramírez'];
        return authors[Math.floor(Math.random() * authors.length)];
    }

    calculateReadTime(newsItem) {
        const content = newsItem.full_content || newsItem.description || '';
        const words = content.split(' ').length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min`;
    }

    getNewsImage(newsItem, index) {
        return this.getFallbackImage(index);
    }

    getFallbackImage(index) {
        const colors = [
            'linear-gradient(135deg, #f59e0b, #d97706)',  // Bitcoin
            'linear-gradient(135deg, #8b5cf6, #7c3aed)',  // Ethereum
            'linear-gradient(135deg, #10b981, #059669)',  // Adopción
            'linear-gradient(135deg, #ec4899, #db2777)',  // NFT
            'linear-gradient(135deg, #6b7280, #4b5563)',  // Regulación
            'linear-gradient(135deg, #06b6d4, #0891b2)'   // DeFi
        ];
        
        const icons = ['₿', 'Ξ', '🚀', '🖼️', '🏛️', '🏦'];
        
        return `<div class="image-placeholder" style="background: ${colors[index]}">
                    ${icons[index]}
                </div>`;
    }

    getNewsCategory(newsItem) {
        const title = (newsItem.title || '').toLowerCase();
        if (title.includes('bitcoin') || title.includes('btc')) return 'bitcoin';
        if (title.includes('ethereum') || title.includes('eth')) return 'ethereum';
        if (title.includes('nft')) return 'nft';
        if (title.includes('defi') || title.includes('finanzas descentralizadas')) return 'defi';
        if (title.includes('regulation') || title.includes('regulación')) return 'regulation';
        if (title.includes('adoption') || title.includes('adopción')) return 'adoption';
        return 'general';
    }

    getCategoryIcon(category) {
        const icons = {
            bitcoin: '₿',
            ethereum: 'Ξ',
            nft: '🖼️',
            defi: '🏦',
            regulation: '🏛️',
            adoption: '🚀',
            general: '📰'
        };
        return icons[category] || '📰';
    }

    getCategoryName(category) {
        const names = {
            bitcoin: 'Bitcoin',
            ethereum: 'Ethereum',
            nft: 'NFT',
            defi: 'DeFi',
            regulation: 'Regulación',
            adoption: 'Adopción',
            general: 'General'
        };
        return names[category] || 'Cripto';
    }

    getCategoryColor(category) {
        const colors = {
            bitcoin: 'linear-gradient(135deg, #f59e0b, #d97706)',
            ethereum: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            nft: 'linear-gradient(135deg, #ec4899, #db2777)',
            defi: 'linear-gradient(135deg, #10b981, #059669)',
            regulation: 'linear-gradient(135deg, #6b7280, #4b5563)',
            adoption: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            general: 'linear-gradient(135deg, #4cc9f0, #3aa8d8)'
        };
        return colors[category] || colors.general;
    }

    cleanTitle(title) {
        if (!title) return 'Noticia Cripto';
        return title
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .substring(0, 80);
    }

    cleanDescription(description) {
        if (!description) return 'Información actualizada sobre criptomonedas y blockchain.';
        return description
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .substring(0, 120) + '...';
    }

    setupNewsRefresh() {
        // Actualizar cada 10 minutos
        setInterval(() => {
            console.log('🔄 Actualizando noticias...');
            this.loadNews();
        }, 10 * 60 * 1000);
    }

    showLoadingState() {
        const newsGrid = document.querySelector('.news-grid');
        if (newsGrid) {
            newsGrid.innerHTML = `
                <div class="news-loading" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div class="loading-spinner"></div>
                    <p>Cargando últimas noticias...</p>
                </div>
            `;
        }
    }

    showErrorState() {
        const newsGrid = document.querySelector('.news-grid');
        if (newsGrid) {
            newsGrid.innerHTML = `
                <div class="news-error" style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #fef2f2; color: #dc2626; border-radius: 12px;">
                    <p>⚠️ No se pudieron cargar las noticias en tiempo real.</p>
                    <p>Mostrando noticias de ejemplo.</p>
                </div>
            `;
        }
    }
}

// Inicialización mejorada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📰 Inicializando NewsSystem...');
        window.newsSystem = new NewsSystem();
    });
} else {
    console.log('📰 Inicializando NewsSystem (DOM ya listo)...');
    window.newsSystem = new NewsSystem();
}
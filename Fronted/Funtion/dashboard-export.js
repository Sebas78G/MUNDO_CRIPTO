// Agregar al final de dashboard-enhanced.js o dashboard.js

// ========================================
// SISTEMA DE EXPORTACIÓN A EXCEL
// ========================================

// Verificar que XLSX esté cargado
function checkXLSXLibrary() {
    if (typeof XLSX === 'undefined') {
        console.error('❌ Librería XLSX no encontrada');
        alert('Error: La librería de Excel no está cargada. Asegúrate de incluir:\n<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>');
        return false;
    }
    return true;
}

// Función para exportar a Excel
function exportDashboardToExcel() {
    console.log('📊 Exportando dashboard a Excel...');
    
    if (!checkXLSXLibrary()) return;
    
    try {
        // Crear libro de trabajo
        const workbook = XLSX.utils.book_new();
        
        // 1. HOJA DE RESUMEN
        const summaryData = [
            ['RESUMEN DEL DASHBOARD'],
            [''],
            ['Métrica', 'Valor'],
            ['Total Invertido', `$${document.getElementById('totalInvested')?.textContent || '0.00'}`],
            ['Total Retirado', `$${document.getElementById('totalWithdrawn')?.textContent || '0.00'}`],
            ['Ganancia/Pérdida Neta', document.getElementById('netProfit')?.textContent || '$0.00'],
            ['Porcentaje', document.getElementById('profitPercentage')?.textContent || '0%'],
            ['Total Transacciones', document.getElementById('totalTransactions')?.textContent || '0'],
            ['Tiempo de Inversión', document.getElementById('investmentTime')?.textContent || '0 días'],
            [''],
            ['Fecha de Exportación', new Date().toLocaleString('es-ES')]
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
        
        // 2. HOJA DE TRANSACCIONES
        const transactionsData = [];
        const tableBody = document.getElementById('transactionsBody');
        
        if (tableBody) {
            // Agregar encabezados
            transactionsData.push([
                'Tipo',
                'Criptomoneda',
                'Cantidad',
                'Precio',
                'Inversión',
                'Valor Venta',
                'Ganancia/Pérdida',
                'Porcentaje',
                'Fecha'
            ]);
            
            // Agregar filas de datos
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const rowData = [];
                cells.forEach(cell => {
                    rowData.push(cell.textContent.trim());
                });
                if (rowData.length > 0) {
                    transactionsData.push(rowData);
                }
            });
        }
        
        const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transacciones');
        
        // 3. GENERAR ARCHIVO
        const fileName = `Dashboard_Cripto_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        // Mostrar notificación de éxito
        showExportNotification('✅ Dashboard exportado a Excel correctamente', 'success');
        console.log('✅ Archivo Excel generado:', fileName);
        
    } catch (error) {
        console.error('❌ Error exportando a Excel:', error);
        showExportNotification('❌ Error al exportar el dashboard', 'error');
    }
}

// Función para mostrar notificación de exportación
function showExportNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
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

// Configurar el botón de exportación
function setupExportButton() {
    // Buscar el botón por ID
    const exportBtn = document.getElementById('exportExcelBtn') || document.getElementById('exportDashboardBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDashboardToExcel);
        console.log('✅ Botón de exportación configurado');
    } else {
        console.warn('⚠️ No se encontró botón de exportación');
    }
}

// Agregar botón de exportación si no existe
function addExportButtonIfNeeded() {
    // Buscar si ya existe
    let exportBtn = document.getElementById('exportExcelBtn');
    
    if (!exportBtn) {
        // Buscar el header de transacciones
        const transactionsHeader = document.querySelector('.transactions-header');
        
        if (transactionsHeader) {
            // Crear botón
            exportBtn = document.createElement('button');
            exportBtn.id = 'exportExcelBtn';
            exportBtn.className = 'btn btn-outline';
            exportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Exportar a Excel';
            exportBtn.style.cssText = `
                background: transparent;
                border: 2px solid #10b981;
                color: #10b981;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            `;
            
            exportBtn.onmouseover = function() {
                this.style.background = '#10b981';
                this.style.color = 'white';
                this.style.transform = 'translateY(-2px)';
            };
            
            exportBtn.onmouseout = function() {
                this.style.background = 'transparent';
                this.style.color = '#10b981';
                this.style.transform = 'translateY(0)';
            };
            
            // Insertar botón
            transactionsHeader.appendChild(exportBtn);
            console.log('✅ Botón de exportación creado');
        }
    }
    
    // Configurar evento
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDashboardToExcel);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Configurando exportación a Excel...');
    
    // Esperar un poco para asegurar que el dashboard esté renderizado
    setTimeout(() => {
        setupExportButton();
        addExportButtonIfNeeded();
    }, 1000);
});

// También configurar si el dashboard ya está cargado
if (document.readyState === 'complete') {
    setTimeout(() => {
        setupExportButton();
        addExportButtonIfNeeded();
    }, 500);
}

console.log('✅ Sistema de exportación a Excel cargado');
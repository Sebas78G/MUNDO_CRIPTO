const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authSystem = require('./auth');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger de requests
app.use((req, res, next) => {
    console.log('📍', new Date().toISOString(), req.method, req.url);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', JSON.stringify(req.body).substring(0, 200));
    }
    next();
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token requerido' });
    }

    const verificationResult = authSystem.verifyToken(token);
    if (!verificationResult.success) {
        return res.status(403).json({ success: false, message: verificationResult.message });
    }
    
    req.user = verificationResult.user;
    next();
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

app.post('/api/register', async (req, res) => {
    const result = await authSystem.registerUser(req.body);

    if (!result.success) {
        const statusCode = result.message.includes('ya está registrado') ? 409 : 400;
        return res.status(statusCode).json(result);
    }

    const loginResult = await authSystem.loginUser({
        email: req.body.email,
        password: req.body.password
    });

    if (loginResult.success) {
        res.status(201).json({
            success: true,
            message: 'Usuario registrado y sesión iniciada correctamente.',
            user: loginResult.user,
            token: loginResult.token
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Usuario registrado, pero ocurrió un error al iniciar sesión.'
        });
    }
});

app.post('/api/login', async (req, res) => {
    const result = await authSystem.loginUser(req.body);
    if (result.success) {
        res.json(result);
    } else {
        const statusCode = result.message.includes('requeridos') ? 400 : 401;
        res.status(statusCode).json(result);
    }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
    const result = await authSystem.getUserProfile(req.user.userId);
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

// ==================== RUTAS DE PORTAFOLIO ====================

// Función auxiliar para limpiar undefined
function cleanNullValues(obj) {
    const cleaned = {};
    for (const key in obj) {
        cleaned[key] = obj[key] === undefined ? null : obj[key];
    }
    return cleaned;
}

app.post('/api/portfolio/save', authenticateToken, async (req, res) => {
    try {
        console.log('📦 Datos recibidos en /portfolio/save:');
        console.log(JSON.stringify(req.body, null, 2));
        
        const pool = require('./database').pool;
        const data = cleanNullValues(req.body);
        const userId = req.user.userId;

        if (['buy', 'sell', 'withdraw'].includes(data.type)) {
            
            console.log('💾 Guardando transacción tipo:', data.type);
            
            const [result] = await pool.execute(
                `INSERT INTO portfolio_transactions 
                (user_id, type, cryptoSymbol, cryptoName, amount, price, investment, 
                 saleValue, purchasePrice, profit, profitPercentage, fee, totalCost, 
                 netAmount, status, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    data.type,
                    data.cryptoSymbol,
                    data.cryptoName,
                    data.amount,
                    data.price,
                    data.investment,
                    data.saleValue,
                    data.purchasePrice,
                    data.profit,
                    data.profitPercentage,
                    data.fee,
                    data.totalCost,
                    data.netAmount,
                    data.status || 'completed',
                    data.timestamp || new Date()
                ]
            );
            
            console.log('✅ Transacción guardada con ID:', result.insertId);
            res.json({ 
                success: true, 
                message: 'Transacción guardada', 
                transactionId: result.insertId 
            });

        } else if (data.type === 'portfolio_snapshot') {
            
            console.log('📸 Guardando snapshot del portafolio');
            
            const [result] = await pool.execute(
                `INSERT INTO portfolio_snapshots 
                (user_id, totalBalance, availableBalance, totalInvested, totalProfit, 
                 totalProfitPercentage, snapshot_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    data.totalBalance || 0,
                    data.availableBalance || 0,
                    data.totalInvested || 0,
                    data.totalProfit || 0,
                    data.totalProfitPercentage || 0,
                    data.snapshot_date || new Date()
                ]
            );
            
            console.log('✅ Snapshot guardado con ID:', result.insertId);
            res.json({ 
                success: true, 
                message: 'Snapshot guardado', 
                snapshotId: result.insertId 
            });

        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Tipo de dato no válido para guardar.' 
            });
        }
        
    } catch (error) {
        console.error('❌ Error en /api/portfolio/save:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor.',
            error: error.message
        });
    }
});

app.get('/api/portfolio/history', authenticateToken, async (req, res) => {
    try {
        const pool = require('./database').pool;
        const limit = req.query.limit || 50;
        
        console.log('📜 Obteniendo historial para usuario:', req.user.userId);
        
        const [transactions] = await pool.execute(
            'SELECT * FROM portfolio_transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
            [req.user.userId, parseInt(limit)]
        );
        
        console.log(`✅ ${transactions.length} transacciones encontradas`);
        res.json({ success: true, data: transactions });
        
    } catch (error) {
        console.error('❌ Error en /api/portfolio/history:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor.' 
        });
    }
});

app.get('/api/portfolio/investments', authenticateToken, async (req, res) => {
    try {
        const pool = require('./database').pool;
        
        console.log('💼 Obteniendo inversiones para usuario:', req.user.userId);
        
        const [investments] = await pool.execute(
            'SELECT * FROM portfolio_investments WHERE user_id = ? ORDER BY currentValue DESC',
            [req.user.userId]
        );
        
        console.log(`✅ ${investments.length} inversiones encontradas`);
        res.json({ success: true, data: investments });
        
    } catch (error) {
        console.error('❌ Error en /api/portfolio/investments:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor.' 
        });
    }
});

// ==================== RUTA DE HEALTH CHECK ====================

app.get('/api/health', async (req, res) => {
    const authHealth = await authSystem.healthCheck();
    res.json({
        server: { 
            success: true, 
            message: 'Servidor funcionando',
            timestamp: new Date().toISOString()
        },
        auth_system: authHealth
    });
});

// ==================== INICIAR SERVIDOR ====================

async function startServer() {
    console.log('🚀 Iniciando servidor...');
    
    if (!await initDatabase()) {
        console.error('❌ No se pudo conectar a la base de datos. Saliendo...');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log('');
        console.log('═══════════════════════════════════════════');
        console.log('  🚀 SERVIDOR MUNDO CRIPTO INICIADO');
        console.log('═══════════════════════════════════════════');
        console.log(`  📡 URL: http://localhost:${PORT}`);
        console.log(`  🗄️  Base de datos: Conectada`);
        console.log(`  ⏰ Iniciado: ${new Date().toLocaleString()}`);
        console.log('═══════════════════════════════════════════');
        console.log('');
    });
}

startServer();
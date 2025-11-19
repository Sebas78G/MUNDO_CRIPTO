const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mundo_cripto_secret_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
    console.log('📍', new Date().toISOString(), req.method, req.url);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', JSON.stringify(req.body).substring(0, 200));
    }
    next();
});

// ========== MIDDLEWARE DE AUTENTICACIÓN (DEBE IR PRIMERO) ==========
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// ========== CONFIGURACIÓN DE BASE DE DATOS ==========
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Guepardo403200519#2006#',
    database: 'mundo_cripto1'
};

let pool;

async function initDatabase() {
    try {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const connection = await pool.getConnection();
        console.log('✅ Conectado a la base de datos MySQL');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
        return false;
    }
}

// ========== RUTAS DEL PORTFOLIO (AHORA SÍ PUEDEN USAR authenticateToken) ==========

// Guardar datos del portafolio - ESTA RUTA AHORA FUNCIONARÁ
app.post('/api/portfolio/save', authenticateToken, async (req, res) => {
    try {
        console.log('💾 /api/portfolio/save - Body recibido:', req.body);
        console.log('💾 /api/portfolio/save - User ID:', req.user.userId);
        
        const data = req.body;
        const userId = req.user.userId;

        console.log('💾 Guardando datos del portafolio:', data.type);

        if (data.type === 'buy' || data.type === 'sell' || data.type === 'withdraw') {
            // Guardar transacción
            const [result] = await pool.execute(
                `INSERT INTO portfolio_transactions 
                (user_id, type, cryptoSymbol, cryptoName, amount, price, investment, 
                 saleValue, purchasePrice, profit, profitPercentage, fee, totalCost, 
                 netAmount, status, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    data.type,
                    data.cryptoSymbol || null,
                    data.cryptoName || null,
                    data.amount || 0,
                    data.price || 0,
                    data.investment || 0,
                    data.saleValue || 0,
                    data.purchasePrice || 0,
                    data.profit || 0,
                    data.profitPercentage || 0,
                    data.fee || 0,
                    data.totalCost || 0,
                    data.netAmount || 0,
                    'completed',
                    data.timestamp || new Date()
                ]
            );

            console.log('✅ Transacción guardada en BD, ID:', result.insertId);

            res.json({
                success: true,
                message: 'Transacción guardada exitosamente',
                transactionId: result.insertId
            });

        } else if (data.type === 'portfolio_snapshot') {
            // Guardar snapshot del portafolio
            const [result] = await pool.execute(
                `INSERT INTO portfolio_snapshots 
                (user_id, totalBalance, availableBalance, totalInvested, 
                 totalProfit, totalProfitPercentage, snapshot_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    data.totalBalance,
                    data.availableBalance,
                    data.totalInvested,
                    data.totalProfit,
                    data.totalProfitPercentage,
                    data.snapshot_date || new Date()
                ]
            );

            console.log('✅ Snapshot guardado en BD, ID:', result.insertId);

            res.json({
                success: true,
                message: 'Snapshot del portafolio guardado',
                snapshotId: result.insertId
            });

        } else {
            console.warn('⚠️ Tipo de dato no válido:', data.type);
            res.status(400).json({
                success: false,
                message: 'Tipo de dato no válido'
            });
        }

    } catch (error) {
        console.error('❌ Error guardando datos del portafolio:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});



// ========== RUTAS DE AUTENTICACIÓN ==========
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        console.log('🔍 Registro attempt:', { email, name });

        // Validaciones
        if (!email || !password || !name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos son requeridos' 
            });
        }

        // Verificar si el usuario ya existe
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El usuario ya existe' 
            });
        }

        // Hash de la contraseña
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
            [email, passwordHash, name]
        );

        // Crear perfil de usuario
        await pool.execute(
            'INSERT INTO user_profiles (user_id, experience_level) VALUES (?, ?)',
            [result.insertId, 'beginner']
        );

        // Generar token
        const token = jwt.sign(
            { userId: result.insertId, email: email, name: name }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        const user = {
            id: result.insertId,
            email: email,
            name: name
        };

        console.log('✅ Usuario registrado:', email);

        res.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: user,
            token: token
        });

    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔍 Login attempt:', email);

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar usuario
        const [users] = await pool.execute(
            'SELECT id, email, password_hash, name FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ Usuario no encontrado:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }

        const user = users[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            console.log('❌ Contraseña incorrecta para:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }

        // Actualizar último login
        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Generar token
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        console.log('✅ Login exitoso:', user.email);

        res.json({
            success: true,
            message: 'Login exitoso',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        console.log('🔍 /api/profile - User ID:', req.user.userId);
        
        const [users] = await pool.execute(
            'SELECT id, email, name, created_at, last_login FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            console.log('❌ Usuario no encontrado en BD:', req.user.userId);
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        const user = users[0];
        console.log('✅ /api/profile - Usuario encontrado:', user.id, user.email);
        
        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('❌ Error en /api/profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// ========== OTRAS RUTAS DEL PORTFOLIO ==========
app.get('/api/portfolio/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 50;
        const type = req.query.type;

        let query = `SELECT * FROM portfolio_transactions WHERE user_id = ?`;
        const params = [userId];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(limit);

        const [transactions] = await pool.execute(query, params);

        res.json({
            success: true,
            data: transactions,
            count: transactions.length
        });

    } catch (error) {
        console.error('❌ Error obteniendo historial:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

app.get('/api/portfolio/investments', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const [investments] = await pool.execute(
            'SELECT * FROM portfolio_investments WHERE user_id = ? ORDER BY currentValue DESC',
            [userId]
        );

        res.json({
            success: true,
            data: investments,
            count: investments.length
        });

    } catch (error) {
        console.error('❌ Error obteniendo inversiones:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ========== INICIALIZACIÓN DEL SERVIDOR ==========
async function startServer() {
    const dbConnected = await initDatabase();
    
    if (!dbConnected) {
        console.error('❌ No se pudo conectar a la base de datos. Saliendo...');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📊 Endpoints disponibles:`);
        console.log(`   POST http://localhost:3000/api/register`);
        console.log(`   POST http://localhost:3000/api/login`);
        console.log(`   GET  http://localhost:3000/api/profile`);
        console.log(`   POST http://localhost:3000/api/portfolio/save`);  // ← ¡NUEVA!
        console.log(`   GET  http://localhost:3000/api/portfolio/history`); // ← ¡NUEVA!
        console.log(`   GET  http://localhost:3000/api/portfolio/investments`); // ← ¡NUEVA!
        console.log(`   GET  http://localhost:3000/api/health`);
        console.log(`✅ Conectado a MySQL correctamente`);
    });
}

startServer().catch(console.error);
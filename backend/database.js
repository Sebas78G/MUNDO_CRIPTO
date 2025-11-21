const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2025*',
    database: process.env.DB_NAME || 'mundo_cripto1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;


async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log('✅ Conectado a la base de datos MySQL:', dbConfig.database);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
        pool = null; 
        return false;
    }
}


module.exports = {
    get pool() {
        if (!pool) {
            throw new Error("El pool de la base de datos no ha sido inicializado. Ejecute initDatabase() primero.");
        }
        return pool;
    },
    initDatabase
};



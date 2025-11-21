const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'mundo_cripto_secret_key_2024';

class AuthSystem {

    getPool() {
        return require('./database').pool;
    }

    async registerUser(userData) {
        try {
            const { email, password, name } = userData;
            
            console.log('📝 Intentando registrar usuario:', { email, name });
            
            if (!email || !password || !name) {
                return { 
                    success: false, 
                    message: 'Todos los campos son requeridos' 
                };
            }

            if (password.length < 6) {
                return { 
                    success: false, 
                    message: 'La contraseña debe tener al menos 6 caracteres' 
                };
            }

            // Verificar si el usuario ya existe
            const [existingUsers] = await this.getPool().execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            
            if (existingUsers.length > 0) {
                return { 
                    success: false, 
                    message: 'El email ya está registrado' 
                };
            }
            
            // Hash de la contraseña
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            // Insertar usuario
            const [result] = await this.getPool().execute(
                'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
                [email, passwordHash, name]
            );
            
            console.log(`✅ Usuario registrado exitosamente: ${email} (ID: ${result.insertId})`);
            
            return { 
                success: true, 
                message: 'Usuario registrado exitosamente',
                userId: result.insertId
            };
            
        } catch (error) {
            console.error('❌ Error en registerUser:', error);
            return { 
                success: false, 
                message: 'Error del servidor al registrar usuario' 
            };
        }
    }
    
    async loginUser(credentials) {
        try {
            const { email, password } = credentials;
            
            console.log('🔐 Intentando login para:', email);
            
            if (!email || !password) {
                return { 
                    success: false, 
                    message: 'Email y contraseña son requeridos' 
                };
            }


            const [users] = await this.getPool().execute(
                `SELECT u.id, u.email, u.password_hash, u.name, u.is_active 
                 FROM users u WHERE u.email = ?`,
                [email]
            );
            
            if (users.length === 0) {
                console.log('❌ Usuario no encontrado:', email);
                return { 
                    success: false, 
                    message: 'Usuario no encontrado' 
                };
            }
            
            const user = users[0];
            console.log('👤 Usuario encontrado:', { id: user.id, name: user.name, email: user.email });
            
  
            if (!user.is_active) {
                return { 
                    success: false, 
                    message: 'Cuenta desactivada' 
                };
            }
            
      
            console.log('🔑 Verificando contraseña...');
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isPasswordValid) {
                console.log('❌ Contraseña incorrecta para:', email);
                return { 
                    success: false, 
                    message: 'Contraseña incorrecta' 
                };
            }
            
            console.log('✅ Contraseña válida');
            
          
            await this.getPool().execute(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [user.id]
            );
            
      
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email,
                    name: user.name
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            console.log(`✅ Login exitoso: ${user.name} (${user.email})`);
            
            return { 
                success: true, 
                message: 'Login exitoso',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name  
                },
                token 
            };
            
        } catch (error) {
            console.error('❌ Error en loginUser:', error);
            return { 
                success: false, 
                message: 'Error del servidor al iniciar sesión' 
            };
        }
    }
    
   
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('✅ Token válido para usuario:', decoded.name);
            return { 
                success: true, 
                user: {
                    userId: decoded.userId,
                    email: decoded.email,
                    name: decoded.name
                } 
            };
        } catch (error) {
            console.error('❌ Token inválido:', error.message);
            return { 
                success: false, 
                message: 'Token inválido o expirado' 
            };
        }
    }
    
    
async getUserProfile(userId) {
    try {
        console.log('📋 Obteniendo perfil para usuario ID:', userId);
        
        const [users] = await this.getPool().execute(
            `SELECT u.id, u.email, u.name, u.created_at, u.last_login
             FROM users u
             WHERE u.id = ?`,
            [userId]
        );
        
        if (users.length === 0) {
            console.log('❌ Usuario no encontrado para perfil ID:', userId);
            return { 
                success: false, 
                message: 'Usuario no encontrado' 
            };
        }
        
        const user = users[0];
        console.log('✅ Perfil obtenido:', { 
            id: user.id, 
            name: user.name,  
            email: user.email 
        });
        
        return { 
            success: true, 
            user: {
                id: user.id,
                email: user.email,
                name: user.name,  
                created_at: user.created_at,
                last_login: user.last_login
            }
        };
    } catch (error) {
        console.error('❌ Error en getUserProfile:', error);
        return { 
            success: false, 
            message: 'Error del servidor al obtener perfil' 
        };
    }
}

    
    async healthCheck() {
        try {
          
            const [result] = await this.getPool().execute('SELECT 1 as health');
            return {
                success: true,
                message: 'Sistema de autenticación funcionando correctamente',
                database: result.length > 0 ? 'Conectado' : 'Error'
            };
        } catch (error) {
            console.error('❌ Error en healthCheck:', error);
            return {
                success: false,
                message: 'Error en el sistema de autenticación',
                database: 'Desconectado'
            };
        }
    }
}

module.exports = new AuthSystem();
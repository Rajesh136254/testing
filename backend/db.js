const mysql = require('mysql2/promise');
require('dotenv').config();

let useMock = false;
let pool;

// Mock data for development
const mockDB = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  ],
  messages: [],
  _userId: 3,
  _messageId: 1,
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'Rajesh',
  password: process.env.DB_PASSWORD || 'Rajesh@254',
  database: process.env.DB_NAME || 'testdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
try {
  pool = mysql.createPool(dbConfig);
  console.log('MySQL pool created');
} catch (err) {
  console.warn('Could not create MySQL pool, falling back to mock DB:', err.message);
  useMock = true;
}

// Test connection
if (!useMock && pool) {
  pool.getConnection()
    .then(conn => {
      conn.release();
      console.log('MySQL pool connection successful');
    })
    .catch(err => {
      console.warn('MySQL pool connection failed, enabling mock DB:', err.message);
      useMock = true;
    });
}

// Mock query implementation
async function mockQuery(sql, params) {
  const s = sql.trim().toUpperCase();
  
  // SELECT queries
  if (s.startsWith('SELECT')) {
    if (s.includes('COUNT(*) AS COUNT FROM USERS')) {
      if (s.includes('WHERE STATUS = ?')) {
        const status = params[0];
        const count = mockDB.users.filter(u => u.status === status).length;
        return [[{ count }]];
      }
      if (s.includes('WHERE DATE(CREATED_AT) = CURDATE()')) {
        return [[{ count: 2 }]]; // Mock 2 new users today
      }
      return [[{ count: mockDB.users.length }]];
    }
    
    if (s.includes('COUNT(*) AS COUNT FROM MESSAGES')) {
      return [[{ count: mockDB.messages.length }]];
    }
    
    if (s.includes('FROM USERS')) {
      return [mockDB.users];
    }
    
    if (s.includes('FROM MESSAGES')) {
      return [mockDB.messages];
    }
  }

  // INSERT queries
  if (s.startsWith('INSERT')) {
    if (s.includes('INTO USERS')) {
      const [name, email, role] = params;
      const id = mockDB._userId++;
      const user = { id, name, email, role, status: 'active' };
      mockDB.users.push(user);
      return [{ insertId: id }];
    }
    
    if (s.includes('INTO MESSAGES')) {
      const [name, email, subject, message] = params;
      const id = mockDB._messageId++;
      const msg = { id, name, email, subject, message, created_at: new Date() };
      mockDB.messages.push(msg);
      return [{ insertId: id }];
    }
  }

  // UPDATE queries
  if (s.startsWith('UPDATE USERS')) {
    const [status, id] = params;
    const user = mockDB.users.find(u => u.id === parseInt(id));
    if (user) {
      user.status = status;
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // DELETE queries
  if (s.startsWith('DELETE')) {
    const id = params[0];
    const before = mockDB.users.length;
    mockDB.users = mockDB.users.filter(u => u.id !== parseInt(id));
    return [{ affectedRows: before - mockDB.users.length }];
  }

  throw new Error('Unsupported mock query: ' + sql);
}

// Main query function
async function query(sql, params) {
  if (!useMock && pool) {
    return pool.query(sql, params);
  }
  return mockQuery(sql, params);
}

// Get database connection
async function getConnection() {
  if (!useMock && pool) {
    return pool.getConnection();
  }
  return { release: () => {} };
}

module.exports = {
  query,
  getConnection,
  _isMock: () => useMock,
};

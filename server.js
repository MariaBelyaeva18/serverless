const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Функция для инициализации базы данных
async function initializeDatabase() {
  try {
    const client = await pool.connect();

    // Создаем таблицу если она не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Database initialized successfully');
    client.release();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Инициализируем базу при старте сервера
initializeDatabase();

// Базовый маршрут
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.status(200).send('Hello, Serverless! 🚀\n');
});

// Эндпоинт для сохранения сообщения в базу
app.post('/save', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Вставляем сообщение в базу данных
    const result = await pool.query(
      'INSERT INTO messages (content) VALUES ($1) RETURNING *',
      [message]
    );

    res.json({
      status: 'saved',
      message: message,
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Эндпоинт для получения списка сообщений
app.get('/messages', async (req, res) => {
  try {
    // Получаем последние 10 сообщений
    const result = await pool.query(`
      SELECT id, content, created_at 
      FROM messages 
      ORDER BY id DESC 
      LIMIT 10
    `);

    // Форматируем результат
    const messages = result.rows.map(row => ({
      id: row.id,
      text: row.content,
      time: row.created_at.toISOString()
    }));

    res.json(messages);

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Эндпоинт echo остается для обратной совместимости
app.post('/echo', (req, res) => {
  try {
    const data = req.body;
    const response = {
      status: 'received',
      you_sent: data,
      length: data ? JSON.stringify(data).length : 0
    };
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

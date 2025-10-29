const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON в теле запроса
app.use(express.json());

// Базовый маршрут
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.status(200).send('Hello, Serverless! 🚀\n');
});

// Новый эндпоинт для обработки POST-запросов с JSON
app.post('/echo', (req, res) => {
  try {
    const data = req.body; // Получаем данные из тела запроса

    // Формируем ответ с полученными данными
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

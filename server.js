const express = require('express');

// Создаем экземпляр приложения Express
const app = express();
const PORT = process.env.PORT || 3000; // Render автоматически назначает порт

// Базовый маршрут - возвращаем текстовый ответ
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.status(200).send('Hello, Serverless! 🚀\n');
});

// Запускаем сервер
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// ============================================================
// server.js — Entry point của toàn bộ ứng dụng backend
// Nhiệm vụ DUY NHẤT: load env, kết nối DB, rồi start HTTP server
// KHÔNG chứa bất kỳ business logic nào ở đây
// ============================================================

// PHẢI gọi dotenv.config() ĐẦU TIÊN, trước khi require bất kỳ module nào khác
// Lý do: các module khác (db.js, app.js) có thể dùng process.env ngay khi được require
// Nếu dotenv.config() gọi sau thì chúng sẽ nhận undefined
require('dotenv').config();

const app = require('./app');            // Express app (routes, middleware)
const connectDB = require('./config/db'); // Hàm kết nối MongoDB

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB trước, sau đó mới bắt đầu lắng nghe request
// Tại sao? Nếu DB chưa kết nối mà có request gọi vào sẽ bị lỗi
// connectDB() trả về Promise, nên dùng .then() để đảm bảo thứ tự
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // Đảm bảo bạn import schema của mình

// Khai báo một biến toàn cục để lưu trữ kết nối
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof neon> | undefined;
  db: NeonHttpDatabase<typeof schema> | undefined;
};

// Kiểm tra xem kết nối đã tồn tại trong biến toàn cục chưa
// Nếu chưa có, tạo mới. Nếu có rồi, dùng lại cái cũ.
const conn = globalForDb.conn ?? neon(process.env.DATABASE_URL!);
const db = globalForDb.db ?? drizzle(conn, { schema });

// Trong môi trường phát triển (development), gán kết nối vào biến toàn cục
// để các lần hot-reload sau có thể tái sử dụng.
if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = conn;
  globalForDb.db = db;
}

// Xuất ra db đã được tối ưu
export { db };

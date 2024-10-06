import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 型定義を拡張する
declare global {
  namespace Express {
    interface Request {
      userId?: number; // userIdをオプションとして追加
    }
  }
}

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'your-refresh-secret-key';

// ユーザー情報の配列
let users = [
  { id: 1, email: 'user@example.com', password: bcrypt.hashSync('password123', 8), name: 'User One', isNursingStudent: false, yearsOfExperience: 5, departments: ['外科'] },
];

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // クッキーを許可
}));
app.use(express.json());
app.use(cookieParser());

// JWT認証用ミドルウェア
const verifyToken = (req: Request, res: Response, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).send('トークンが提供されていません');
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(500).send('トークンの認証に失敗しました');
    req.userId = (decoded as { id: number }).id;
    next();
  });
};

// ユーザー登録用のエンドポイント
app.post('/api/register', (req: Request, res: Response) => {
  const { email, password, name, isNursingStudent, yearsOfExperience, departments } = req.body;

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).send({ message: 'このメールアドレスは既に登録されています' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = {
    id: users.length + 1,
    email,
    password: hashedPassword,
    name,
    isNursingStudent,
    yearsOfExperience,
    departments,
  };
  users.push(newUser);

  const accessToken = jwt.sign({ id: newUser.id }, SECRET_KEY, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: newUser.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
  res.json({ accessToken });
});

// その他のエンドポイント...

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`サーバーがポート${PORT}で起動しました`));

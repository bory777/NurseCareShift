// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';

declare global {
  namespace Express {
    interface Request {
      userId?: number; // userIdをオプションとして追加
    }
  }
}

type LoginRequestBody = {
  email: string;
  password: string;
};

// 環境変数の読み込み
dotenv.config();

// シークレットキーを.envファイルから読み込み
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// ダミーデータとしてのユーザー情報（本来はデータベースから取得）
const users = [
  {
    id: 1,
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 8), // パスワードをハッシュ化
  },
];

// Expressアプリの作成
const app = express();

// CORSを有効にして、異なるポートからのリクエストを許可
app.use(cors({
  origin: 'http://localhost:3000', // フロントエンドが動作しているポートを指定
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 認証情報を扱えるようにする
}));

app.use(express.json()); // リクエストボディをJSON形式で解析

// ログインエンドポイントの作成
app.post('/api/login', (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { email, password } = req.body;

  // ユーザーの存在確認
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'ユーザーが見つかりません' });
  }

  // パスワードの検証
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: '無効なパスワードです' });
  }

  // JWTトークンの発行
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: '1h', // トークンの有効期限は1時間
  });

  // トークンをレスポンスとして返す
  return res.json({
    message: 'ログイン成功',
    token: token, // トークンをフロントエンドに返却
  });
});

// JWT認証用のミドルウェア
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // ヘッダーからトークンを取得
  const token = req.headers['authorization']?.split(' ')[1]; // Bearerトークン形式の場合
  if (!token) {
    return res.status(403).send({ message: 'トークンが提供されていません' });
  }

  // トークンの検証
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'トークンの認証に失敗しました' });
    }
    req.userId = (decoded as { id: number }).id; // 型アサーションでトークンからユーザーIDを取得
    next();
  });
};

// プロテクトされたルートの例
app.get('/api/profile', verifyToken, (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'ユーザーが見つかりません' });
  }
  res.json({
    id: user.id,
    email: user.email,
  });
});

// サーバーの起動
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});

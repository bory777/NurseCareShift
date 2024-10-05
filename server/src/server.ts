import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';  // multerをインポート
import fs from 'fs'; // 必要に応じて、ファイルシステム操作を使用

// 型定義を拡張
declare global {
  namespace Express {
    interface Request {
      userId?: number; // userIdをオプションとして追加
    }
  }
}

// 環境変数の読み込み
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// ダミーのユーザーデータ
const users = [
  {
    id: 1,
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 8),
  },
];

// Expressアプリの作成
const app = express();

// CORSを設定
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// multerの設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // アップロード先のフォルダを指定
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // ファイル名をユニークにする
  }
});

const upload = multer({ storage: storage });

// JWT認証用のミドルウェア
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).send({ message: 'トークンが提供されていません' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'トークンの認証に失敗しました' });
    }
    req.userId = (decoded as { id: number }).id;
    next();
  });
};

// 画像アップロード用エンドポイント
app.post('/api/upload', verifyToken, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'ファイルが提供されていません' });
  }

  // アップロードされた画像のパスをレスポンスとして返す
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// プロフィール取得のAPIエンドポイント
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

// 静的ファイルとしてuploadsフォルダを公開
app.use('/uploads', express.static('uploads'));

// サーバーの起動
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});

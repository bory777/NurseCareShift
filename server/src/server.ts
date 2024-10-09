import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import AppleStrategy from 'passport-apple';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';

dotenv.config();

interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
}

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // クライアントのURL
  credentials: true, // クッキーを含むリクエストを許可
}));
app.use(express.json());
app.use(cookieParser());

const users: User[] = []; // ユーザー情報を格納する配列
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'your-refresh-secret-key';
const refreshTokens: string[] = []; // 有効なリフレッシュトークンのリスト

// JWTを生成する関数
const generateToken = (user: User) => jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
const generateRefreshToken = (user: User) => jwt.sign({ id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

// Nodemailerを使ったモックメール送信の設定
const transport = nodemailer.createTransport({
  jsonTransport: true, // メールを送信せずにJSON形式で出力
});

// グローバルなリクエストロギング
app.use((req: Request, res: Response, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// JWT検証ミドルウェア
const verifyToken = (req: Request, res: Response, next: any) => {
  const token = req.cookies.accessToken; // クッキーからトークンを取得
  if (!token) {
    return res.status(403).json({ error: 'トークンが必要です' });
  }
  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'トークンが期限切れです' });
      }
      return res.status(401).json({ error: '無効なトークンです' });
    }
    req.userId = decoded.id;
    next();
  });
};

// ダッシュボードアクセスルート（JWT認証必須）
app.get('/api/dashboard', verifyToken, (req: Request, res: Response) => {
  const user = users.find(user => user.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }
  res.json({ message: `ようこそ、${user.name}さん。ダッシュボードへようこそ！` });
});

// ユーザー情報を取得するエンドポイント
app.get('/api/profile', verifyToken, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json'); // Content-Typeを設定
  const user = users.find(user => user.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword); // JSON形式でレスポンスを返す
});

// ユーザー登録エンドポイント
app.post('/api/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(400).json({ error: 'このメールアドレスは既に使用されています' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser: User = { id: users.length + 1, email, password: hashedPassword, name };
  users.push(newUser);

  const accessToken = generateToken(newUser);
  const refreshToken = generateRefreshToken(newUser);
  refreshTokens.push(refreshToken); // リフレッシュトークンを保存

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // CSRF対策
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ message: '登録成功' });
});

// ユーザーログインエンドポイント
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }

  if (!user.password) {
    return res.status(400).json({ error: 'パスワードが設定されていません' });
  }

  const passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    return res.status(401).json({ error: '無効なパスワード' });
  }

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.push(refreshToken);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ message: 'ログイン成功' });
});

// リフレッシュトークンを使ってアクセストークンを再発行するエンドポイント
app.post('/api/refresh-token', (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ error: 'リフレッシュトークンが必要です' });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: '無効なリフレッシュトークンです' });
  }

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: '無効なリフレッシュトークンです' });
    }

    const user = users.find(user => user.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const newAccessToken = generateToken(user);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1時間
    });

    res.json({ message: '新しいアクセストークンが発行されました' });
  });
});

// リクエストに含まれるクッキー内のアクセストークンを検証するエンドポイント
app.get('/api/check-auth', (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: '認証されていません' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'トークンが期限切れです' });
      }
      return res.status(401).json({ error: '無効なトークンです' });
    }
    res.status(200).json({ message: '認証されています' });
  });
});

// ログアウトエンドポイント（トークンを無効化してホームにリダイレクト）
app.post('/api/logout', (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: 'ログアウトに失敗しました' });
  }

  const index = refreshTokens.indexOf(refreshToken);
  if (index !== -1) {
    refreshTokens.splice(index, 1);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({ message: 'ログアウト成功' });
});

// サーバー起動
app.listen(8000, () => {
  console.log('サーバーがポート8000で起動しました');
});

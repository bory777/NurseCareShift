import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import AppleStrategy from 'passport-apple'; // 修正
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

interface User {
  id: number;
  email: string;
  password?: string; // OAuthではパスワードがない場合もあるためオプションとする
  name: string;
}

const app = express();

// CORS設定: クライアントのlocalhost:3000からのリクエストを許可
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const users: User[] = []; // ユーザー配列

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'your-refresh-secret-key';

// JWTを生成するヘルパー関数
const generateToken = (user: User) => jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

// Google OAuth認証設定
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: 'http://localhost:8000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  const user = { id: profile.id, email: profile.emails ? profile.emails[0].value : '', name: profile.displayName };
  done(null, user);
}));

// Twitter OAuth認証設定
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY!,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
  callbackURL: 'http://localhost:8000/auth/twitter/callback'
}, (token, tokenSecret, profile, done) => {
  const user = { id: profile.id, username: profile.username };
  done(null, user);
}));

// Instagram OAuth認証設定
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID!,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
  callbackURL: 'http://localhost:8000/auth/instagram/callback'
}, (accessToken, refreshToken, profile, done) => {
  const user = { id: profile.id, username: profile.username };
  done(null, user);
}));

// Apple OAuth認証設定
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID!,
  teamID: process.env.APPLE_TEAM_ID!,
  keyID: process.env.APPLE_KEY_ID!,
  privateKey: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n'), // 改行文字を修正
  callbackURL: 'http://localhost:8000/auth/apple/callback',
  scope: ['name', 'email']
}, (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
  const user = { id: profile.id, email: profile.email || '' };
  done(null, user);
}));

app.use(passport.initialize());

// 認証ルート
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  const token = generateToken(req.user as User);
  res.redirect(`http://localhost:3000/success?token=${token}`);
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), (req, res) => {
  const token = generateToken(req.user as User);
  res.redirect(`http://localhost:3000/success?token=${token}`);
});

app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/' }), (req, res) => {
  const token = generateToken(req.user as User);
  res.redirect(`http://localhost:3000/success?token=${token}`);
});

app.get('/auth/apple', passport.authenticate('apple'));
app.get('/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/' }), (req, res) => {
  const token = generateToken(req.user as User);
  res.redirect(`http://localhost:3000/success?token=${token}`);
});

// その他のルート（例：ユーザー登録、ログイン、認証）
app.post('/api/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(400).send('このメールアドレスは既に使用されています。');
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser: User = { id: users.length + 1, email, password: hashedPassword, name };
  users.push(newUser);

  const accessToken = generateToken(newUser);
  const refreshToken = jwt.sign({ id: newUser.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });
  res.json({ accessToken });
});

app.listen(8000, () => {
  console.log('サーバーがポート8000で起動しました');
});

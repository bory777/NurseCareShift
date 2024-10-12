import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import csurf from 'csurf';
import crypto from 'crypto';

import sequelize from './db';
import User from './models/User';
import Profile from './models/Profile';
import Article from './models/Article';
import Post from './models/Post';
import { authorize } from './middlewares/authorize';

dotenv.config();

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
    csrfToken: () => string;
  }
}

// ユーザー配列が User 型の配列であると仮定
const users: User[] = [];

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000', // クライアントのURL
    credentials: true, // クッキーを含むリクエストを許可
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// CSRF対策
app.use(csurf({ cookie: true }));

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'your-refresh-secret-key';
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-email-password';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';

const refreshTokens: string[] = []; // 有効なリフレッシュトークンのリスト
const tokenBlacklist: string[] = []; // 無効化されたアクセストークンのリスト

// レートリミットを設定（1分間に100リクエストまで）
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  handler: (req: Request, res: Response) => {
    res.status(429).json({ error: 'リクエストが多すぎます。後でもう一度お試しください。' });
  },
});
// 特定のエンドポイントにのみ適用
app.use('/api/', limiter);

// JWTを生成する関数
const generateToken = (user: User) =>
  jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: '15m',
  });
const generateRefreshToken = (user: User) =>
  jwt.sign({ id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

// Nodemailerを使ったメール送信の設定
const transport = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: 587,
  secure: false, // TLSを使用しない
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// グローバルなリクエストロギング
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// エラーハンドリングミドルウェア
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました。' });
};

// JWT検証ミドルウェア（ブラックリストチェックを追加）
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(403).json({ error: '認証が必要です。' });
  }

  // トークンがブラックリストにあるか確認
  if (tokenBlacklist.includes(token)) {
    return res.status(401).json({ error: '無効なトークンです。再ログインしてください。' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: '無効な認証情報です。' });
    }
    req.userId = decoded.id;
    next();
  });
};

// ユーザー登録エンドポイント
app.post(
  '/api/register',
  [
    // 入力値のバリデーションとサニタイズ
    body('email')
      .trim()
      .isEmail()
      .withMessage('有効なメールアドレスを入力してください。')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('パスワードは8文字以上である必要があります。')
      .matches(/[A-Z]/)
      .withMessage('大文字を1文字以上含めてください。')
      .matches(/[a-z]/)
      .withMessage('小文字を1文字以上含めてください。')
      .matches(/\d/)
      .withMessage('数字を1文字以上含めてください。')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('特殊文字を1文字以上含めてください。'),
    body('role')
      .optional()
      .isIn(['admin', 'official', 'general'])
      .withMessage('有効なロールを指定してください。'),
  ],
  async (req: Request, res: Response) => {
    try {
      // CSRFトークンの取得と設定
      const csrfToken = req.csrfToken();
      res.cookie('XSRF-TOKEN', csrfToken);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // すべてのエラーメッセージを配列で返す
        const extractedErrors = errors.array().map((err) => err.msg);
        return res.status(400).json({ errors: extractedErrors });
      }

      const { email, password, role } = req.body;
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ errors: ['このメールアドレスは既に使用されています。'] });
      }

      // 一般ユーザーが管理者や公式アカウントを作成できないようにする
      let userRole: 'admin' | 'official' | 'general' = 'general';
      if (role && role !== 'general') {
        return res.status(403).json({ error: '権限がありません。' });
      } else if (role) {
        userRole = role;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // 6桁の認証コードを生成
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 3600000); // 1時間後に期限切れ

      const newUser = await User.create({
        email,
        password: hashedPassword,
        isVerified: false,
        role: userRole,
        verificationCode,
        verificationCodeExpires,
      });

      // プロファイルの作成（空のプロファイル）
      await Profile.create({
        userId: newUser.id,
      });

      // 認証コードをメールで送信
      const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'メールアドレスの確認',
        text: `以下の6桁の確認コードを入力してください: ${verificationCode}`,
        html: `<p>以下の6桁の確認コードを入力してください:</p><h2>${verificationCode}</h2>`,
      };

      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('メールの送信に失敗しました:', error);
          return res.status(500).json({ error: 'メールの送信に失敗しました。' });
        } else {
          console.log('確認メールが送信されました:', info.response);
          res.json({ message: '登録成功。確認メールを送信しました。' });
        }
      });
    } catch (error) {
      console.error('ユーザー登録エラー:', error);
      res.status(500).json({ error: 'ユーザー登録に失敗しました。' });
    }
  }
);

// メール確認エンドポイント
app.post('/api/verify-email', [
  body('email')
    .trim()
    .isEmail().withMessage('有効なメールアドレスを入力してください。')
    .normalizeEmail(),
  body('verificationCode')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('6桁の確認コードを入力してください。')
    .isNumeric().withMessage('確認コードは数字のみを含めてください。'),
], (req: Request, res: Response) => {
  try {
    // CSRFトークンの取得と設定
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map(err => err.msg);
      return res.status(400).json({ errors: extractedErrors });
    }

    const { email, verificationCode } = req.body;
    const user = users.find(user => user.email === email);

    if (!user || user.verificationCode !== verificationCode) {
      return res.status(400).json({ errors: ['確認コードが正しくありません。'] });
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires.getTime() < Date.now()) {
      return res.status(400).json({ errors: ['確認コードが期限切れです。'] });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    res.json({ message: 'メールアドレスが確認されました。' });
  } catch (error) {
    console.error('メール確認エラー:', error);
    res.status(500).json({ error: 'メール確認に失敗しました。' });
  }
});

// ユーザーログインエンドポイント
app.post('/api/login', [
  body('email')
    .trim()
    .isEmail().withMessage('有効なメールアドレスを入力してください。')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty().withMessage('パスワードを入力してください。'),
], async (req: Request, res: Response) => {
  try {
    // CSRFトークンの取得と設定
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map(err => err.msg);
      return res.status(400).json({ errors: extractedErrors });
    }

    const { email, password } = req.body;
    const user = users.find(user => user.email === email);

    if (!user || !user.password) {
      return res.status(400).json({ errors: ['メールアドレスまたはパスワードが正しくありません。'] });
    }

    if (!user.isVerified) {
      return res.status(400).json({ errors: ['メールアドレスが確認されていません。'] });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(400).json({ errors: ['メールアドレスまたはパスワードが正しくありません。'] });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 本番環境では true
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15分
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 本番環境では true
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
    });

    res.json({ message: 'ログイン成功' });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'ログインに失敗しました。' });
  }
});

// パスワードリセット要求エンドポイント
app.post('/api/request-password-reset', [
  body('email')
    .trim()
    .isEmail().withMessage('有効なメールアドレスを入力してください。')
    .normalizeEmail(),
], (req: Request, res: Response) => {
  try {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map(err => err.msg);
      return res.status(400).json({ errors: extractedErrors });
    }

    const { email } = req.body;
    const user = users.find(user => user.email === email);

    if (!user) {
      return res.status(400).json({ errors: ['メールアドレスが登録されていません。'] });
    }

    // パスワードリセットトークンを生成
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1時間後に期限切れ

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;

    // リセットリンクをメールで送信
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'パスワードリセットのご案内',
      text: `以下のリンクをクリックしてパスワードをリセットしてください: ${resetLink}`,
      html: `<p>以下のリンクをクリックしてパスワードをリセットしてください:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('メールの送信に失敗しました:', error);
        return res.status(500).json({ error: 'メールの送信に失敗しました。' });
      } else {
        console.log('パスワードリセットメールが送信されました:', info.response);
        res.json({ message: 'パスワードリセットのメールを送信しました。' });
      }
    });
  } catch (error) {
    console.error('パスワードリセット要求エラー:', error);
    res.status(500).json({ error: 'パスワードリセット要求に失敗しました。' });
  }
});

// パスワードリセットエンドポイント
app.post('/api/reset-password', [
  body('email')
    .trim()
    .isEmail().withMessage('有効なメールアドレスを入力してください。')
    .normalizeEmail(),
  body('token')
    .trim()
    .notEmpty().withMessage('トークンが必要です。'),
  body('newPassword')
    .trim()
    .isLength({ min: 8 }).withMessage('パスワードは8文字以上である必要があります。')
    .matches(/[A-Z]/).withMessage('大文字を1文字以上含めてください。')
    .matches(/[a-z]/).withMessage('小文字を1文字以上含めてください。')
    .matches(/\d/).withMessage('数字を1文字以上含めてください。')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('特殊文字を1文字以上含めてください。'),
], async (req: Request, res: Response) => {
  try {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map(err => err.msg);
      return res.status(400).json({ errors: extractedErrors });
    }

    const { email, token, newPassword } = req.body;
    const user = users.find(user => user.email === email);

    if (!user || user.resetPasswordToken !== token || (user.resetPasswordExpires && user.resetPasswordExpires.getTime() < Date.now())) {
      return res.status(400).json({ errors: ['無効なトークンです。'] });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    res.json({ message: 'パスワードがリセットされました。' });
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    res.status(500).json({ error: 'パスワードリセットに失敗しました。' });
  }
});

// ログアウトエンドポイント
app.post('/api/logout', verifyToken, (req: Request, res: Response) => {
  try {
    const token = req.cookies.accessToken;

    // トークンをブラックリストに追加
    if (token) {
      tokenBlacklist.push(token);
    }

    // クッキーをクリア
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: 'ログアウトしました。' });
  } catch (error) {
    console.error('ログアウトエラー:', error);
    res.status(500).json({ error: 'ログアウトに失敗しました。' });
  }
});

// 管理者用エンドポイント
app.get('/api/admin/users', verifyToken, authorize(['admin']), async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: [{ model: Profile, as: 'profile' }],
    });
    res.json(users);
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    res.status(500).json({ error: 'ユーザー一覧の取得に失敗しました。' });
  }
});

app.get('/api/admin/users/:id', verifyToken, authorize(['admin']), async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Profile, as: 'profile' }],
    });
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません。' });
    }
    res.json(user);
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    res.status(500).json({ error: 'ユーザーの取得に失敗しました。' });
  }
});

app.delete('/api/admin/users/:id', verifyToken, authorize(['admin']), async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません。' });
    }
    await user.destroy();
    res.json({ message: 'ユーザーを削除しました。' });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    res.status(500).json({ error: 'ユーザーの削除に失敗しました。' });
  }
});

app.put('/api/admin/users/:id/role', verifyToken, authorize(['admin']), [
  body('role')
    .isIn(['admin', 'official', 'general'])
    .withMessage('有効なロールを指定してください。'),
], async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません。' });
    }
    user.role = role;
    await user.save();
    res.json({ message: 'ユーザーのロールを更新しました。' });
  } catch (error) {
    console.error('ロール更新エラー:', error);
    res.status(500).json({ error: 'ロールの更新に失敗しました。' });
  }
});

// エラーハンドリングミドルウェアを最後に配置
app.use(errorHandler);

// サーバー起動前にデータベースとモデルを同期
sequelize.sync({ force: false }).then(() => {
  // サーバー起動
  app.listen(8000, () => {
    console.log('サーバーがポート8000で起動しました');
  });
});

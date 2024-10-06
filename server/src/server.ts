import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';

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
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'your-refresh-secret-key';

// ダミーのユーザーデータ
const users = [
  {
    id: 1,
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 8),
  },
];

// リフレッシュトークンの保存場所（簡易的にメモリに保存、実際はDBに保存するべき）
let refreshTokens: string[] = [];

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
      console.error('アクセストークンの認証に失敗しました:', err.message);
      return res.status(500).send({ message: 'トークンの認証に失敗しました' });
    }
    req.userId = (decoded as { id: number }).id;
    next();
  });
};

// JWTペイロードの型を定義
interface JwtPayload {
  id: number;
}

// ログイン用のエンドポイント（アクセストークン & リフレッシュトークンの生成）
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    console.error('認証エラー: ユーザーが存在しないか、パスワードが違います');
    return res.status(401).send({ message: '認証に失敗しました' });
  }

  // アクセストークンとリフレッシュトークンを生成
  const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

  // リフレッシュトークンを保存
  refreshTokens.push(refreshToken);

  console.log('ログイン成功: アクセストークンとリフレッシュトークンを生成');
  console.log('アクセストークン:', accessToken);
  console.log('リフレッシュトークン:', refreshToken);

  res.json({ accessToken, refreshToken });
});

// リフレッシュトークンを使ったトークンの更新
app.post('/api/token', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    console.error('リフレッシュトークンが提供されていません');
    return res.status(401).send({ message: 'リフレッシュトークンが提供されていません' });
  }

  if (!refreshTokens.includes(token)) {
    console.error('無効なリフレッシュトークンです');
    return res.status(403).send({ message: '無効なリフレッシュトークンです' });
  }

  jwt.verify(token, REFRESH_SECRET_KEY, (err: any, decoded: any) => {
    if (err || !decoded) {
      console.error('リフレッシュトークンの認証に失敗しました:', err?.message || '不明なエラー');
      return res.status(403).send({ message: 'リフレッシュトークンの認証に失敗しました' });
    }

    const userId = decoded.id;
    const newAccessToken = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
    console.log('リフレッシュトークン認証成功、新しいアクセストークンを生成');
    res.json({ accessToken: newAccessToken });
  });
});

// ログアウト（リフレッシュトークンの削除）
app.post('/api/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);
  console.log('ログアウト成功: リフレッシュトークンを削除');
  res.status(200).send({ message: 'ログアウトしました' });
});

// 画像アップロード用エンドポイント
app.post('/api/upload', verifyToken, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'ファイルが提供されていません' });
  }
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// プロフィール取得のAPIエンドポイント
app.get('/api/profile', verifyToken, (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    console.error('ユーザープロフィールが見つかりません');
    return res.status(404).json({ message: 'ユーザーが見つかりません' });
  }
  console.log('プロフィール取得成功: ユーザーID:', user.id);
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

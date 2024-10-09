"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true, // クッキーを含むリクエストを許可
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const users = []; // ユーザー情報を格納する配列
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'your-refresh-secret-key';
const refreshTokens = []; // 有効なリフレッシュトークンのリスト
// JWTを生成する関数
const generateToken = (user) => jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
const generateRefreshToken = (user) => jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
// Nodemailerを使ったモックメール送信の設定
const transport = nodemailer_1.default.createTransport({
    jsonTransport: true, // メールを送信せずにJSON形式で出力
});
// グローバルなリクエストロギング
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});
// JWT検証ミドルウェア
const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken; // クッキーからトークンを取得
    if (!token) {
        return res.status(403).json({ error: 'トークンが必要です' });
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
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
app.get('/api/dashboard', verifyToken, (req, res) => {
    const user = users.find(user => user.id === req.userId);
    if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    res.json({ message: `ようこそ、${user.name}さん。ダッシュボードへようこそ！` });
});
// ユーザー情報を取得するエンドポイント
app.get('/api/profile', verifyToken, (req, res) => {
    res.setHeader('Content-Type', 'application/json'); // Content-Typeを設定
    const user = users.find(user => user.id === req.userId);
    if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return res.json(userWithoutPassword); // JSON形式でレスポンスを返す
});
// ユーザー登録エンドポイント
app.post('/api/register', (req, res) => {
    const { email, password, name } = req.body;
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'このメールアドレスは既に使用されています' });
    }
    const hashedPassword = bcryptjs_1.default.hashSync(password, 8);
    const newUser = { id: users.length + 1, email, password: hashedPassword, name };
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
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    if (!user.password) {
        return res.status(400).json({ error: 'パスワードが設定されていません' });
    }
    const passwordIsValid = bcryptjs_1.default.compareSync(password, user.password);
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
app.post('/api/refresh-token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(403).json({ error: 'リフレッシュトークンが必要です' });
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ error: '無効なリフレッシュトークンです' });
    }
    jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
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
app.get('/api/check-auth', (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ error: '認証されていません' });
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
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
app.post('/api/logout', (req, res) => {
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

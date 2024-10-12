"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_validator_1 = require("express-validator");
const csurf_1 = __importDefault(require("csurf"));
const crypto_1 = __importDefault(require("crypto"));
;
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true, // クッキーを含むリクエストを許可
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
// CSRF対策
app.use((0, csurf_1.default)({ cookie: true }));
const users = []; // ユーザー情報を格納する配列
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'your-refresh-secret-key';
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-email-password';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';
const refreshTokens = []; // 有効なリフレッシュトークンのリスト
const tokenBlacklist = []; // 無効化されたアクセストークンのリスト
// レートリミットを設定（1分間に100リクエストまで）
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    handler: (req, res) => {
        res.status(429).json({ error: 'リクエストが多すぎます。後でもう一度お試しください。' });
    },
});
// 特定のエンドポイントにのみ適用
app.use('/api/', limiter);
// JWTを生成する関数
const generateToken = (user) => jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '15m' });
const generateRefreshToken = (user) => jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
// Nodemailerを使ったメール送信の設定
const transport = nodemailer_1.default.createTransport({
    host: EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});
// グローバルなリクエストロギング
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});
// エラーハンドリングミドルウェア
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'サーバーエラーが発生しました。' });
};
// JWT検証ミドルウェア（ブラックリストチェックを追加）
const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(403).json({ error: '認証が必要です。' });
    }
    // トークンがブラックリストにあるか確認
    if (tokenBlacklist.includes(token)) {
        return res.status(401).json({ error: '無効なトークンです。再ログインしてください。' });
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: '無効な認証情報です。' });
        }
        req.userId = decoded.id;
        next();
    });
};
// ユーザー登録エンドポイント
app.post('/api/register', [
    // 入力値のバリデーションとサニタイズ
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail().withMessage('有効なメールアドレスを入力してください。')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .trim()
        .isLength({ min: 8 }).withMessage('パスワードは8文字以上である必要があります。')
        .matches(/[A-Z]/).withMessage('大文字を1文字以上含めてください。')
        .matches(/[a-z]/).withMessage('小文字を1文字以上含めてください。')
        .matches(/\d/).withMessage('数字を1文字以上含めてください。')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('特殊文字を1文字以上含めてください。'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // CSRFトークンの取得と設定
        const csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', csrfToken);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            // すべてのエラーメッセージを配列で返す
            const extractedErrors = errors.array().map(err => err.msg);
            return res.status(400).json({ errors: extractedErrors });
        }
        const { email, password } = req.body;
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ errors: ['このメールアドレスは既に使用されています。'] });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        // 6桁の認証コードを生成
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = Date.now() + 3600000; // 1時間後に期限切れ
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationCode,
            verificationCodeExpires,
        };
        users.push(newUser);
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
            }
            else {
                console.log('確認メールが送信されました:', info.response);
                res.json({ message: '登録成功。確認メールを送信しました。' });
            }
        });
    }
    catch (error) {
        console.error('ユーザー登録エラー:', error);
        res.status(500).json({ error: 'ユーザー登録に失敗しました。' });
    }
}));
// メール確認エンドポイント
app.post('/api/verify-email', [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail().withMessage('有効なメールアドレスを入力してください。')
        .normalizeEmail(),
    (0, express_validator_1.body)('verificationCode')
        .trim()
        .isLength({ min: 6, max: 6 }).withMessage('6桁の確認コードを入力してください。')
        .isNumeric().withMessage('確認コードは数字のみを含めてください。'),
], (req, res) => {
    try {
        // CSRFトークンの取得と設定
        const csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', csrfToken);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const extractedErrors = errors.array().map(err => err.msg);
            return res.status(400).json({ errors: extractedErrors });
        }
        const { email, verificationCode } = req.body;
        const user = users.find(user => user.email === email);
        if (!user || user.verificationCode !== verificationCode) {
            return res.status(400).json({ errors: ['確認コードが正しくありません。'] });
        }
        if (user.verificationCodeExpires && user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ errors: ['確認コードが期限切れです。'] });
        }
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        res.json({ message: 'メールアドレスが確認されました。' });
    }
    catch (error) {
        console.error('メール確認エラー:', error);
        res.status(500).json({ error: 'メール確認に失敗しました。' });
    }
});
// ユーザーログインエンドポイント
app.post('/api/login', [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail().withMessage('有効なメールアドレスを入力してください。')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty().withMessage('パスワードを入力してください。'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // CSRFトークンの取得と設定
        const csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', csrfToken);
        const errors = (0, express_validator_1.validationResult)(req);
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
        const passwordIsValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(400).json({ errors: ['メールアドレスまたはパスワードが正しくありません。'] });
        }
        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15分
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
        });
        res.json({ message: 'ログイン成功' });
    }
    catch (error) {
        console.error('ログインエラー:', error);
        res.status(500).json({ error: 'ログインに失敗しました。' });
    }
}));
// パスワードリセット要求エンドポイント
app.post('/api/request-password-reset', [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail().withMessage('有効なメールアドレスを入力してください。')
        .normalizeEmail(),
], (req, res) => {
    try {
        const csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', csrfToken);
        const errors = (0, express_validator_1.validationResult)(req);
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
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1時間後に期限切れ
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
            }
            else {
                console.log('パスワードリセットメールが送信されました:', info.response);
                res.json({ message: 'パスワードリセットのメールを送信しました。' });
            }
        });
    }
    catch (error) {
        console.error('パスワードリセット要求エラー:', error);
        res.status(500).json({ error: 'パスワードリセット要求に失敗しました。' });
    }
});
// パスワードリセットエンドポイント
app.post('/api/reset-password', [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail().withMessage('有効なメールアドレスを入力してください。')
        .normalizeEmail(),
    (0, express_validator_1.body)('token')
        .trim()
        .notEmpty().withMessage('トークンが必要です。'),
    (0, express_validator_1.body)('newPassword')
        .trim()
        .isLength({ min: 8 }).withMessage('パスワードは8文字以上である必要があります。')
        .matches(/[A-Z]/).withMessage('大文字を1文字以上含めてください。')
        .matches(/[a-z]/).withMessage('小文字を1文字以上含めてください。')
        .matches(/\d/).withMessage('数字を1文字以上含めてください。')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('特殊文字を1文字以上含めてください。'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const csrfToken = req.csrfToken();
        res.cookie('XSRF-TOKEN', csrfToken);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const extractedErrors = errors.array().map(err => err.msg);
            return res.status(400).json({ errors: extractedErrors });
        }
        const { email, token, newPassword } = req.body;
        const user = users.find(user => user.email === email);
        if (!user || user.resetPasswordToken !== token || (user.resetPasswordExpires && user.resetPasswordExpires < Date.now())) {
            return res.status(400).json({ errors: ['無効なトークンです。'] });
        }
        user.password = yield bcryptjs_1.default.hash(newPassword, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        res.json({ message: 'パスワードがリセットされました。' });
    }
    catch (error) {
        console.error('パスワードリセットエラー:', error);
        res.status(500).json({ error: 'パスワードリセットに失敗しました。' });
    }
}));
// ログアウトエンドポイント
app.post('/api/logout', verifyToken, (req, res) => {
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
    }
    catch (error) {
        console.error('ログアウトエラー:', error);
        res.status(500).json({ error: 'ログアウトに失敗しました。' });
    }
});
// エラーハンドリングミドルウェアを最後に配置
app.use(errorHandler);
// サーバー起動
app.listen(8000, () => {
    console.log('サーバーがポート8000で起動しました');
});

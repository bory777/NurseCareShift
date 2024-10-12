// middlewares/authorize.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const authorize = (roles: ('admin' | 'official' | 'general')[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(403).json({ error: 'ユーザーが見つかりません。' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'アクセス権限がありません。' });
      }

      next();
    } catch (error) {
      console.error('認証エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  };
};

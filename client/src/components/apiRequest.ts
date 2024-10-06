// apiRequest.ts
import { useAuth } from './AuthContext';

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const { token, login } = useAuth();
  
  // ヘッダーにアクセストークンを追加
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, {
    ...options,
    credentials: 'include', // クッキーを送信するため
  });

  // トークンの有効期限が切れている場合はリフレッシュトークンで新しいアクセストークンを取得
  if (response.status === 401) {
    const refreshResponse = await fetch('http://localhost:8000/api/token', {
      method: 'POST',
      credentials: 'include', // クッキーを送信するため
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      login(refreshData.accessToken);

      // 新しいアクセストークンで再試行
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${refreshData.accessToken}`,
      };
      response = await fetch(url, options);
    } else {
      throw new Error('リフレッシュトークンの更新に失敗しました');
    }
  }

  if (!response.ok) {
    throw new Error('リクエストに失敗しました');
  }

  return response.json();
};

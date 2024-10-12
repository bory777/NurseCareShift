// PasswordReset.tsx
import React, { useReducer, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

// CSRFトークンを取得する関数
const getCsrfToken = () => {
  const matches = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return matches ? decodeURIComponent(matches[1]) : '';
};

type Field = 'email' | 'token' | 'newPassword' | 'confirmNewPassword';

interface PasswordResetProps {
  onResetSuccess: () => void;
}

interface State {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
  errors: {
    email?: string;
    token?: string;
    newPassword?: string[];
    confirmNewPassword?: string;
  };
}

type Action =
  | { type: 'SET_FIELD'; field: Field; value: string }
  | { type: 'SET_ERROR'; field: Field; error: string | string[] | null }
  | { type: 'CLEAR_ERRORS' };

const initialState: State = {
  email: '',
  token: '',
  newPassword: '',
  confirmNewPassword: '',
  errors: {},
};

// バリデーション関数
const validateEmail = (email: string): string | null => {
  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) ? null : '有効なメールアドレスを入力してください。';
};

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('8文字以上');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含める');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含める');
  }
  if (!/\d/.test(password)) {
    errors.push('数字を含める');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('特殊文字を含める');
  }

  return errors;
};

// Reducer関数
function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    default:
      return state;
  }
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onResetSuccess }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  // URLパラメータからemailとtokenを取得
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email') || '';
    const token = params.get('token') || '';

    dispatch({ type: 'SET_FIELD', field: 'email', value: decodeURIComponent(email) });
    dispatch({ type: 'SET_FIELD', field: 'token', value: token });
  }, [location.search]);

  // 入力変更時の処理
  const handleChange = (field: Field) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    dispatch({ type: 'SET_FIELD', field, value });

    // リアルタイムバリデーション
    if (field === 'email') {
      const emailError = validateEmail(value);
      dispatch({ type: 'SET_ERROR', field: 'email', error: emailError });
    }

    if (field === 'newPassword') {
      const passwordErrors = validatePassword(value);
      dispatch({
        type: 'SET_ERROR',
        field: 'newPassword',
        error: passwordErrors.length > 0 ? passwordErrors : null,
      });

      // パスワードと確認用パスワードの一致チェック
      if (state.confirmNewPassword) {
        const confirmPasswordError =
          value === state.confirmNewPassword ? null : 'パスワードが一致しません。';
        dispatch({
          type: 'SET_ERROR',
          field: 'confirmNewPassword',
          error: confirmPasswordError,
        });
      }
    }

    if (field === 'confirmNewPassword') {
      const confirmPasswordError =
        value === state.newPassword ? null : 'パスワードが一致しません。';
      dispatch({
        type: 'SET_ERROR',
        field: 'confirmNewPassword',
        error: confirmPasswordError,
      });
    }

    if (field === 'token') {
      // トークンのバリデーション（必要に応じて実装）
      if (!value) {
        dispatch({
          type: 'SET_ERROR',
          field: 'token',
          error: 'トークンを入力してください。',
        });
      } else {
        dispatch({ type: 'SET_ERROR', field: 'token', error: null });
      }
    }
  };

  // パスワードリセットの処理
  const handleResetPassword = async () => {
    // 全てのエラーをクリア
    dispatch({ type: 'CLEAR_ERRORS' });

    // 入力値の最終バリデーション
    const emailError = validateEmail(state.email);
    const passwordErrors = validatePassword(state.newPassword);
    const confirmPasswordError =
      state.newPassword === state.confirmNewPassword
        ? null
        : 'パスワードが一致しません。';
    const tokenError = state.token ? null : 'トークンを入力してください。';

    let hasError = false;

    if (emailError) {
      dispatch({ type: 'SET_ERROR', field: 'email', error: emailError });
      hasError = true;
    }
    if (passwordErrors.length > 0) {
      dispatch({
        type: 'SET_ERROR',
        field: 'newPassword',
        error: passwordErrors,
      });
      hasError = true;
    }
    if (confirmPasswordError) {
      dispatch({
        type: 'SET_ERROR',
        field: 'confirmNewPassword',
        error: confirmPasswordError,
      });
      hasError = true;
    }
    if (tokenError) {
      dispatch({ type: 'SET_ERROR', field: 'token', error: tokenError });
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const csrfToken = getCsrfToken();

      // サーバーにリクエストを送信
      const response = await fetch(
        'http://localhost:8000/api/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            email: state.email,
            token: state.token,
            newPassword: state.newPassword,
          }),
          credentials: 'include', // クッキーを送信する場合
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const serverErrors = data.errors || [data.error] || ['パスワードリセットに失敗しました。'];
        alert(serverErrors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      // リセット成功
      alert('パスワードがリセットされました。ログインしてください。');
      onResetSuccess();
    } catch (error) {
      console.error('パスワードリセットエラー:', error);
      alert('サーバーへの接続に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="password-reset-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          パスワードリセット
        </h2>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* メールアドレス */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={state.email}
              onChange={handleChange('email')}
              placeholder="メールアドレス"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                state.errors.email ? 'border-red-500' : ''
              }`}
              aria-invalid={!!state.errors.email}
              aria-describedby="email-error"
              required
            />
            {state.errors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-1">
                {state.errors.email}
              </p>
            )}
          </div>

          {/* トークン */}
          <div>
            <label htmlFor="token" className="block text-gray-700 mb-2">
              リセットトークン
            </label>
            <input
              id="token"
              type="text"
              value={state.token}
              onChange={handleChange('token')}
              placeholder="メールで受け取ったトークンを入力"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                state.errors.token ? 'border-red-500' : ''
              }`}
              aria-invalid={!!state.errors.token}
              aria-describedby="token-error"
              required
            />
            {state.errors.token && (
              <p id="token-error" className="text-red-500 text-sm mt-1">
                {state.errors.token}
              </p>
            )}
          </div>

          {/* 新しいパスワード */}
          <div>
            <label htmlFor="newPassword" className="block text-gray-700 mb-2">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={state.newPassword}
                onChange={handleChange('newPassword')}
                placeholder="新しいパスワード"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  state.errors.newPassword ? 'border-red-500' : ''
                }`}
                aria-invalid={!!state.errors.newPassword}
                aria-describedby="new-password-error"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </div>
            </div>
            {state.errors.newPassword && (
              <ul
                id="new-password-error"
                className="text-red-500 text-sm mt-1 list-disc pl-5"
              >
                {state.errors.newPassword.map((error, index) => (
                  <li key={index}>パスワードは{error}必要があります。</li>
                ))}
              </ul>
            )}
          </div>

          {/* パスワード確認 */}
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-gray-700 mb-2"
            >
              新しいパスワード（確認用）
            </label>
            <div className="relative">
              <input
                id="confirmNewPassword"
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={state.confirmNewPassword}
                onChange={handleChange('confirmNewPassword')}
                placeholder="新しいパスワード（確認用）"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  state.errors.confirmNewPassword ? 'border-red-500' : ''
                }`}
                aria-invalid={!!state.errors.confirmNewPassword}
                aria-describedby="confirm-new-password-error"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() =>
                  setShowConfirmNewPassword(!showConfirmNewPassword)
                }
              >
                {showConfirmNewPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </div>
            </div>
            {state.errors.confirmNewPassword && (
              <p
                id="confirm-new-password-error"
                className="text-red-500 text-sm mt-1"
              >
                {state.errors.confirmNewPassword}
              </p>
            )}
          </div>

          {/* パスワードリセットボタン */}
          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'リセット中...' : 'パスワードをリセット'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;

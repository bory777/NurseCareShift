import React, { useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Field = 'email' | 'password' | 'username' | 'snsLinked';

const validateEmail = (email: string): string | null => {
  return /\S+@\S+\.\S+/.test(email) ? null : '有効なメールアドレスを入力してください。';
};

const validatePassword = (password: string): string | null => {
  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return 'パスワードは8文字以上で、大文字、数字、特殊文字を含む必要があります。';
  }
  return null;
};

// 初期状態
const initialState = {
  email: '',
  password: '',
  username: '',
  snsLinked: false,
  errors: {} as { email?: string; password?: string },
};

// reducer
function formReducer(state: typeof initialState, action: any) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.error } };
    case 'SET_SNS_LINKED':
      return { ...state, snsLinked: action.value };
    default:
      return state;
  }
}

const InitialRegistration: React.FC = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const navigate = useNavigate();

  const handleChange = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });

    if (field === 'email') {
      const emailError = validateEmail(e.target.value);
      dispatch({ type: 'SET_ERROR', field: 'email', error: emailError });
    }
    if (field === 'password') {
      const passwordError = validatePassword(e.target.value);
      dispatch({ type: 'SET_ERROR', field: 'password', error: passwordError });
    }
  };

  const handleSNSLink = (snsPlatform: string) => {
    // SNSアカウント連携の処理
    console.log(`${snsPlatform} 連携中...`);
    dispatch({ type: 'SET_SNS_LINKED', value: true });
    // SNS連携が完了したら次のステップに進む
    navigate('/dob-input'); // 次のページに遷移
  };

  const handleRegister = () => {
    const emailError = validateEmail(state.email);
    const passwordError = validatePassword(state.password);

    dispatch({ type: 'SET_ERROR', field: 'email', error: emailError });
    dispatch({ type: 'SET_ERROR', field: 'password', error: passwordError });

    if (!emailError && !passwordError && !state.snsLinked) {
      console.log('登録データ:', state);
      // メール認証画面へ遷移
      navigate('/email-verification');
    }
  };

  return (
    <div className="register-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">アカウント登録</h2>

        <form className="space-y-6">
          {/* アカウント名 */}
          <input
            type="text"
            value={state.username}
            onChange={handleChange('username')}
            placeholder="アカウント名"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* メールアドレス */}
          <input
            type="email"
            value={state.email}
            onChange={handleChange('email')}
            placeholder="メールアドレス"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${state.errors.email ? 'border-red-500' : ''}`}
            aria-invalid={!!state.errors.email}
            aria-describedby="email-error"
          />
          {state.errors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{state.errors.email}</p>}

          {/* パスワード */}
          <input
            type="password"
            value={state.password}
            onChange={handleChange('password')}
            placeholder="パスワード"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${state.errors.password ? 'border-red-500' : ''}`}
            aria-invalid={!!state.errors.password}
            aria-describedby="password-error"
          />
          {state.errors.password && <p id="password-error" className="text-red-500 text-sm mt-1">{state.errors.password}</p>}

          {/* SNSアカウント連携 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-600">SNSアカウントで登録</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSNSLink('Google')}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 hover:bg-red-600"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSNSLink('Twitter')}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 hover:bg-blue-600"
              >
                Twitter
              </button>
              <button
                type="button"
                onClick={() => handleSNSLink('Apple')}
                className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 hover:bg-gray-900"
              >
                Apple
              </button>
              <button
                type="button"
                onClick={() => handleSNSLink('LINE')}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 hover:bg-green-600"
              >
                LINE
              </button>
              <button
                type="button"
                onClick={() => handleSNSLink('Instagram')}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 hover:bg-pink-600"
              >
                Instagram
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg shadow-lg transition duration-300 mt-6"
          >
            メールアドレスで登録
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialRegistration;

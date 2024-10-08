import React, { useReducer } from 'react';
import { FaGoogle, FaInstagram, FaApple } from 'react-icons/fa'; // SNSアイコン
import { SiX } from 'react-icons/si'; // X (旧Twitter) アイコン

type Field = 'email' | 'password' | 'username' | 'snsLinked';

interface InitialRegistrationProps {
  onNext: (data: { email: string; password: string; username: string }) => void;
}

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

const InitialRegistration: React.FC<InitialRegistrationProps> = ({ onNext }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

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

  const handleRegister = () => {
    const emailError = validateEmail(state.email);
    const passwordError = validatePassword(state.password);

    dispatch({ type: 'SET_ERROR', field: 'email', error: emailError });
    dispatch({ type: 'SET_ERROR', field: 'password', error: passwordError });

    if (!emailError && !passwordError) {
      // 次のステップに進むためのデータを親コンポーネントに渡す
      onNext({
        email: state.email,
        password: state.password,
        username: state.username,
      });
    }
  };

  const handleOAuthLogin = (provider: string) => {
    // 各SNS認証用のルートにリダイレクト
    window.location.href = `http://localhost:8000/auth/${provider}`;
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
          <div className="flex justify-center space-x-6 mt-6">
            <FaGoogle
              className="text-red-500 text-4xl cursor-pointer"
              onClick={() => handleOAuthLogin('google')}
            />
            <SiX
              className="text-black text-4xl cursor-pointer"
              onClick={() => handleOAuthLogin('x')}
            />
            <FaInstagram
              className="text-pink-500 text-4xl cursor-pointer"
              onClick={() => handleOAuthLogin('instagram')}
            />
            <FaApple
              className="text-black text-4xl cursor-pointer"
              onClick={() => handleOAuthLogin('apple')}
            />
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

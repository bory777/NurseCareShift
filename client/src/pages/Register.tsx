import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [name, setName] = useState('');
  const [isNursingStudent, setIsNursingStudent] = useState(false);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 診療科の選択肢
  const departmentOptions = [
    { value: '外科', label: '外科' },
    { value: '内科', label: '内科' },
    { value: '小児科', label: '小児科' },
    { value: '産婦人科', label: '産婦人科' },
    { value: '精神科', label: '精神科' },
    { value: '整形外科', label: '整形外科' },
    { value: '皮膚科', label: '皮膚科' },
    { value: '眼科', label: '眼科' },
    { value: '耳鼻咽喉科', label: '耳鼻咽喉科' },
    { value: '泌尿器科', label: '泌尿器科' },
    { value: '心臓血管外科', label: '心臓血管外科' },
    { value: '呼吸器科', label: '呼吸器科' },
    { value: '腎臓内科', label: '腎臓内科' },
    { value: '消化器内科', label: '消化器内科' },
    { value: '放射線科', label: '放射線科' },
    { value: '麻酔科', label: '麻酔科' },
    { value: '救急科', label: '救急科' },
    { value: 'リハビリテーション科', label: 'リハビリテーション科' },
    { value: 'その他', label: 'その他' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          isNursingStudent,
          yearsOfExperience: isNursingStudent ? 0 : yearsOfExperience,
          departments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登録に失敗しました');
      }

      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">新規登録</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="パスワード（確認用）"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />

          <label className="block mb-2">
            <input
              type="checkbox"
              checked={isNursingStudent}
              onChange={(e) => setIsNursingStudent(e.target.checked)}
            />
            看護学生ですか？
          </label>

          {!isNursingStudent && (
            <>
              <input
                type="number"
                placeholder="看護師としての経験年数"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <label className="block mb-2">経験のある診療科:</label>
              <Select
                isMulti
                options={departmentOptions}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map(option => option.value);
                  setDepartments(selectedValues);
                }}
                value={departmentOptions.filter(option => departments.includes(option.value))}
                className="mb-4"
              />
            </>
          )}

          <button type="submit" className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">
            登録
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

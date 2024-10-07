import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [snsNotifications, setSnsNotifications] = useState<string[]>([]);
  const navigate = useNavigate();

  const snsOptions = ['Google', 'Twitter', 'Apple', 'LINE', 'Instagram'];

  const handleSnsChange = (sns: string) => {
    setSnsNotifications((prev) =>
      prev.includes(sns)
        ? prev.filter((item) => item !== sns)
        : [...prev, sns]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const notificationSettings = {
      emailNotifications,
      snsNotifications,
    };
    console.log('通知設定:', notificationSettings);
    navigate('/confirmation'); // 確認ページへ遷移
  };

  return (
    <div className="notification-settings-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">通知設定</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* メール通知 */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="mr-2"
              />
              メールで通知を受け取る
            </label>
          </div>

          {/* SNS通知 */}
          <div className="mb-4">
            <h3 className="font-bold text-gray-700">SNSで通知を受け取る</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {snsOptions.map((sns) => (
                <label key={sns} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={snsNotifications.includes(sns)}
                    onChange={() => handleSnsChange(sns)}
                    className="mr-2"
                  />
                  {sns}
                </label>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)} // 前のページに戻る
              className="bg-gray-300 text-gray-700 py-3 px-4 rounded-lg shadow-lg"
            >
              戻る
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-3 px-4 rounded-lg shadow-lg"
            >
              確認へ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;

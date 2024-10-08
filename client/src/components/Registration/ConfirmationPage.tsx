import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ConfirmationProps {
  formData: {
    email: string;
    username: string;
    birthdate: string;
    gender: string;
    departments: string[];
    experienceYears: { [key: string]: string };
    certifiedNurseDetails: string[];
    specialistNurseDetails: string[];
    advancedNurseDetails: string[];
    notificationSettings: {
      emailNotifications: boolean;
      snsNotifications: string[];
    };
  };
}

const ConfirmationPage: React.FC<ConfirmationProps> = ({ formData }) => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // 全ての情報をコンソールで確認（本来はサーバーに送信）
    console.log('アカウント情報:', formData);
    
    // サーバーに登録する処理をここで実装（APIコール等）
    
    // 登録が完了したら次のページへ遷移
    navigate('/success');
  };

  return (
    <div className="confirmation-page flex justify-center items-center min-h-screen bg-blue-50 font-poppins">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">確認ページ</h2>

        <div className="space-y-6">
          {/* アカウント情報の確認 */}
          <div>
            <h3 className="font-bold text-gray-700">アカウント情報</h3>
            <p><strong>メールアドレス:</strong> {formData.email}</p>
            <p><strong>アカウント名:</strong> {formData.username}</p>
            <p><strong>生年月日:</strong> {formData.birthdate}</p>
            <p><strong>性別:</strong> {formData.gender}</p>
          </div>

          {/* 職務情報の確認 */}
          <div>
            <h3 className="font-bold text-gray-700">職務情報</h3>
            <p><strong>診療科:</strong> {formData.departments.join(', ')}</p>
            {formData.departments.map((department) => (
              <p key={department}><strong>{department} の経験年数:</strong> {formData.experienceYears[department]}</p>
            ))}
            <p><strong>認定看護師資格:</strong> {formData.certifiedNurseDetails.join(', ') || 'なし'}</p>
            <p><strong>専門看護師資格:</strong> {formData.specialistNurseDetails.join(', ') || 'なし'}</p>
            <p><strong>特定行為看護師資格:</strong> {formData.advancedNurseDetails.join(', ') || 'なし'}</p>
          </div>

          {/* 通知設定の確認 */}
          <div>
            <h3 className="font-bold text-gray-700">通知設定</h3>
            <p><strong>メール通知:</strong> {formData.notificationSettings.emailNotifications ? '受け取る' : '受け取らない'}</p>
            <p><strong>SNS通知:</strong> {formData.notificationSettings.snsNotifications.length > 0 ? formData.notificationSettings.snsNotifications.join(', ') : 'なし'}</p>
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
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-3 px-4 rounded-lg shadow-lg"
            >
              登録
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;

import React, { useState } from 'react';
import InitialRegistration from '../components/Registration/InitialRegistration'; // 初期登録ステップ
import EmailVerification from '../components/Registration/EmailVerification'; // メール認証ステップ
import DobInput from '../components/Registration/DobInput'; // 生年月日入力
import JobInfoInput from '../components/Registration/JobInfoInput'; // 職務情報入力
import NotificationSettings from '../components/Registration/NotificationSettings'; // 通知設定
import ConfirmationPage from '../components/Registration/ConfirmationPage'; // 最終確認

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    birthdate: '',
    gender: '',
    departments: [],
    experienceYears: {},
    certifiedNurseDetails: [],
    specialistNurseDetails: [],
    advancedNurseDetails: [],
    notificationSettings: {
      emailNotifications: false,
      snsNotifications: [],
    },
    verificationCode: '', // 認証コード
  });

  const [step, setStep] = useState(1); // 現在のステップを管理

  // ステップ進行を管理する関数
  const handleNext = (data?: any) => {
    if (data) {
      setFormData({ ...formData, ...data }); // データがある場合のみマージ
    }
    setStep(step + 1); // 次のステップへ進む
  };

  // ステップを戻る関数
  const handleBack = () => {
    setStep(step - 1); // ステップを1つ戻す
  };

  return (
    <div>
      {/* ステップごとにコンポーネントを表示 */}
      {step === 1 && <InitialRegistration onNext={handleNext} />}
      {step === 2 && <EmailVerification onNext={handleNext} />}
      {step === 3 && <DobInput onNext={handleNext} />}
      {step === 4 && <JobInfoInput onNext={handleNext} />}
      {step === 5 && <NotificationSettings onNext={handleNext} onBack={handleBack} />}
      {step === 6 && <ConfirmationPage onBack={handleBack} formData={formData} />}
    </div>
  );
};

export default RegistrationPage;

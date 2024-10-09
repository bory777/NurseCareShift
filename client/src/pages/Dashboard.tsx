import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // navigateをインポート
import { useAuth } from '../components/AuthContext';
import LogoutButton from '../components/LogoutButton';
import { Carousel } from 'react-responsive-carousel';
import { FaCheckCircle, FaRedoAlt } from 'react-icons/fa';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ProfileSection from '../components/ProfileSection'; // プロフィールセクションをインポート

const genres = [
  { name: '血圧', link: '/articles/blood-pressure' },
  { name: '呼吸', link: '/articles/respiration' },
  { name: '脳神経', link: '/articles/neurology' },
  { name: '心拍数', link: '/articles/heart-rate' },
  { name: '体温', link: '/articles/body-temperature' },
  // 他のジャンルも追加可能
];

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<{ id: number; name: string } | null>(null);
  const [understoodArticles, setUnderstoodArticles] = useState<number>(10); // 理解した記事数
  const [reviewArticles, setReviewArticles] = useState<number>(5); // 復習したい記事数
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate(); // navigateを取得

  useEffect(() => {
    if (!token) {
      setError('ログインが必要です');
      navigate('/login'); // トークンがない場合はログイン画面にリダイレクト
      return;
    }

    // プロフィール取得のAPIリクエスト
    const fetchProfile = async (accessToken: string) => {
      try {
        const response = await fetch('http://localhost:8000/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include', // HttpOnlyクッキーを含める
        });

        // アクセストークンが無効な場合、リフレッシュトークンを使って再認証
        if (response.status === 401) {
          const refreshResponse = await fetch('http://localhost:8000/api/refresh-token', {
            method: 'POST',
            credentials: 'include', // HttpOnlyクッキーを送信
          });

          if (!refreshResponse.ok) {
            throw new Error('再認証に失敗しました');
          }

          const refreshData = await refreshResponse.json();

          if (refreshData.message === '新しいアクセストークンが発行されました') {
            // 新しいアクセストークンでプロフィールを再取得
            const newProfileResponse = await fetch('http://localhost:8000/api/profile', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // 更新されたトークンを使用
              },
              credentials: 'include',
            });

            if (newProfileResponse.ok) {
              const newProfileData = await newProfileResponse.json();
              setProfile(newProfileData);
            } else {
              throw new Error('プロフィールの取得に失敗しました');
            }
          }
        } else {
          const profileData = await response.json();
          setProfile(profileData);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProfile(token);
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-blue-50 p-10">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">ダッシュボード</h2>

        {/* ユーザープロフィールカード */}
        <div className="flex w-full space-x-6">
          {/* 左側: プロフィールセクション */}
          <div className="w-1/3">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {profile ? (
              <ProfileSection
                user={{ name: profile.name }} // emailは渡さない
                understoodCount={understoodArticles}
                reviewCount={reviewArticles}
              />
            ) : (
              !error && <p>プロフィールを読み込み中...</p>
            )}
          </div>

          {/* 右側: 進捗状況のカード */}
          <div className="w-2/3 bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-700 text-center mb-6">進捗状況</h3>
            <div className="space-y-4">
              {/* 診療科別の進捗バー */}
              <div>
                <p className="text-lg font-semibold text-gray-700">外科</p>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-right text-gray-500 text-sm mt-1">60% 完了</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-700">内科</p>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <p className="text-right text-gray-500 text-sm mt-1">40% 完了</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-700">小児科</p>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-right text-gray-500 text-sm mt-1">80% 完了</p>
              </div>
            </div>
          </div>
        </div>

        {/* カルーセル部分 */}
        <div className="mt-12 w-full">
          <Carousel
            showArrows={false}
            showThumbs={false}
            infiniteLoop
            centerMode
            centerSlidePercentage={20} // 5つ表示
            autoPlay
            interval={3000}
            transitionTime={500}
          >
            {genres.map((genre) => (
              <div key={genre.name} className="p-4">
                <a href={genre.link} className="block bg-gray-200 p-6 rounded-lg shadow-md hover:bg-blue-200">
                  <p className="text-xl font-semibold text-gray-700">{genre.name}</p>
                </a>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

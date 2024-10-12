// components/AccountMenu/ProfileEdit.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const ProfileEdit: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // サーバーにプロフィール情報を送信する処理
    await updateProfile({ name, bio, profileImage });
    alert('プロフィールを更新しました。');
  };

  return (
    <div>
      <h2>プロフィール編集</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>名前:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>自己紹介:</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <label>プロフィール画像:</label>
          <input type="file" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} />
        </div>
        <button type="submit">更新</button>
      </form>
    </div>
  );
};

export default ProfileEdit;

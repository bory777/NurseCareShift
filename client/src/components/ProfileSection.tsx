// ProfileSection.tsx
import React from 'react';

const ProfileSection: React.FC<{ user: { name: string; email: string }; understoodCount: number; reviewCount: number; }> = ({ user, understoodCount, reviewCount }) => {
  return (
    <div className="profile-section bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold">プロフィール</h2>
      <p>名前: {user.name}</p>
      <p>メール: {user.email}</p>
      <div className="mt-4">
        <button className="bg-green-500 text-white p-2 rounded">理解した記事: {understoodCount}</button>
        <button className="bg-yellow-500 text-white p-2 rounded ml-4">復習したい記事: {reviewCount}</button>
      </div>
    </div>
  );
};

export default ProfileSection;

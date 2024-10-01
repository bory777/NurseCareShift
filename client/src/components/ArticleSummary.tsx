// ArticleSummary.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArticleSummary: React.FC<{ understoodCount: number; reviewCount: number }> = ({ understoodCount, reviewCount }) => {
  const navigate = useNavigate();

  return (
    <div className="article-summary bg-gray-100 p-4 rounded shadow-md">
      <h2 className="text-lg font-bold">記事のまとめ</h2>
      <div className="mt-4">
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => navigate('/understood-articles')}>
          理解した記事: {understoodCount}
        </button>
        <button className="bg-red-500 text-white p-2 rounded ml-4" onClick={() => navigate('/review-articles')}>
          復習したい記事: {reviewCount}
        </button>
      </div>
    </div>
  );
};

export default ArticleSummary;

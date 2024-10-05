import React from 'react';
import { useLocation } from 'react-router-dom';

const PreviewPage: React.FC = () => {
  const location = useLocation();
  const { title, content } = location.state as { title: string; content: string };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* 記事のタイトル */}
        <h1 className="text-4xl font-bold mb-6">{title}</h1>

        {/* 記事のコンテンツ */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: content }} // HTML形式のコンテンツをレンダリング
        />
      </div>
    </div>
  );
};

export default PreviewPage;

// ReviewArticles.tsx
import React from 'react';

const ReviewArticles: React.FC = () => {
  const articles = [
    { id: 1, title: '記事 3' },
    { id: 2, title: '記事 4' },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">復習したい記事</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewArticles;

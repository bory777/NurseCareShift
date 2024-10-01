// UnderstoodArticles.tsx
import React from 'react';

const UnderstoodArticles: React.FC = () => {
  const articles = [
    { id: 1, title: '記事 1' },
    { id: 2, title: '記事 2' },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">理解した記事</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default UnderstoodArticles;

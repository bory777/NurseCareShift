import React, { useState } from 'react';

const PostArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // フォームのバリデーション
    if (!title || !content) {
      setError('タイトルと内容を入力してください');
      return;
    }

    // 送信ロジック
    console.log('記事送信:', { title, content });
    setSuccess('記事が正常に投稿されました！');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-10">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-8">
        <h2 className="text-4xl font-bold text-blue-600 mb-8 text-center">記事投稿</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-lg font-medium text-gray-700">
              内容
            </label>
            <textarea
              id="content"
              className="w-full p-3 h-96 border border-gray-300 rounded-lg"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            投稿する
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostArticle;

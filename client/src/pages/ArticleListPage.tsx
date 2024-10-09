import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

// ダミーデータ: 公式記事
const officialArticles = [
  { id: 1, title: '公式記事 1', description: 'これは公式の記事1の説明です。' },
  { id: 2, title: '公式記事 2', description: 'これは公式の記事2の説明です。' },
  { id: 3, title: '公式記事 3', description: 'これは公式の記事3の説明です。' },
  { id: 4, title: '公式記事 4', description: 'これは公式の記事4の説明です。' },
  { id: 5, title: '公式記事 5', description: 'これは公式の記事5の説明です。' },
];

// ダミーデータ: ユーザー作成記事（ジャンルが満遍なく設定された15個の記事）
const userArticles = [
  { id: 1, title: 'ユーザー記事 1', description: '血圧の記事です。', likes: 5, genre: '血圧' },
  { id: 2, title: 'ユーザー記事 2', description: '呼吸の記事です。', likes: 12, genre: '呼吸' },
  { id: 3, title: 'ユーザー記事 3', description: '心拍数の記事です。', likes: 8, genre: '心拍数' },
  { id: 4, title: 'ユーザー記事 4', description: '脳神経の記事です。', likes: 7, genre: '脳神経' },
  { id: 5, title: 'ユーザー記事 5', description: '体温の記事です。', likes: 15, genre: '体温' },
  { id: 6, title: 'ユーザー記事 6', description: '血圧の記事です。', likes: 9, genre: '血圧' },
  { id: 7, title: 'ユーザー記事 7', description: '呼吸の記事です。', likes: 4, genre: '呼吸' },
  { id: 8, title: 'ユーザー記事 8', description: '心拍数の記事です。', likes: 11, genre: '心拍数' },
  { id: 9, title: 'ユーザー記事 9', description: '脳神経の記事です。', likes: 6, genre: '脳神経' },
  { id: 10, title: 'ユーザー記事 10', description: '体温の記事です。', likes: 14, genre: '体温' },
  { id: 11, title: 'ユーザー記事 11', description: '血圧の記事です。', likes: 13, genre: '血圧' },
  { id: 12, title: 'ユーザー記事 12', description: '呼吸の記事です。', likes: 5, genre: '呼吸' },
  { id: 13, title: 'ユーザー記事 13', description: '心拍数の記事です。', likes: 18, genre: '心拍数' },
  { id: 14, title: 'ユーザー記事 14', description: '脳神経の記事です。', likes: 9, genre: '脳神経' },
  { id: 15, title: 'ユーザー記事 15', description: '体温の記事です。', likes: 20, genre: '体温' },
];

const genres = ['血圧', '呼吸', '脳神経', '心拍数', '体温'];

const ArticleListPage: React.FC = () => {
  const [sortedArticles, setSortedArticles] = useState(userArticles);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // ジャンル選択によるフィルタリング
  useEffect(() => {
    if (selectedGenre) {
      const filtered = userArticles.filter((article) => article.genre === selectedGenre);
      setSortedArticles(filtered);
    } else {
      setSortedArticles(userArticles); // ジャンル未選択時は全て表示
    }
  }, [selectedGenre]);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-4xl font-bold mb-6">記事一覧</h2>

      {/* 公式記事セクション */}
      <section className="mb-12">
        <h3 className="text-3xl font-semibold mb-4">公式記事</h3>
        <div className="carousel-container" style={{ height: '33vh' }}>
          <Carousel
            showThumbs={false}
            showArrows={true}
            autoPlay
            infiniteLoop
            centerMode
            centerSlidePercentage={33.33}
          >
            {officialArticles.map((article) => (
              <div
                key={article.id}
                className="p-6 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-all"
                style={{ height: '33vh' }}
              >
                <h4 className="text-2xl font-bold">{article.title}</h4>
                <p className="text-gray-700 mt-2">{article.description}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ランダム記事セクション */}
      <section className="mb-12">
        <h3 className="text-3xl font-semibold mb-4">新しい記事を発見</h3>
        <div className="carousel-container" style={{ height: '33vh' }}>
          <Carousel
            showThumbs={false}
            showArrows={true}
            autoPlay
            infiniteLoop
            centerMode
            centerSlidePercentage={33.33}
          >
            {userArticles.sort(() => Math.random() - 0.5).map((article) => (
              <div
                key={article.id}
                className="p-6 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-all"
                style={{ height: '33vh' }}
              >
                <h4 className="text-2xl font-bold">{article.title}</h4>
                <p className="text-gray-600">{article.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">ジャンル: {article.genre}</span>
                  <span className="text-sm text-gray-500">👍 {article.likes}</span>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ランキング順記事セクション */}
      <section className="mb-12">
        <h3 className="text-3xl font-semibold mb-4">トップ記事</h3>
        <div className="carousel-container" style={{ height: '33vh' }}>
          <Carousel
            showThumbs={false}
            showArrows={true}
            autoPlay
            infiniteLoop
            centerMode
            centerSlidePercentage={33.33}
          >
            {userArticles
              .sort((a, b) => b.likes - a.likes)
              .map((article) => (
                <div
                  key={article.id}
                  className="p-6 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-all"
                  style={{ height: '33vh' }}
                >
                  <h4 className="text-2xl font-bold mb-2">{article.title}</h4>
                  <p className="text-gray-600">{article.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">ジャンル: {article.genre}</span>
                    <span className="text-sm text-gray-500">👍 {article.likes}</span>
                  </div>
                </div>
              ))}
          </Carousel>
        </div>
      </section>

      {/* ジャンル別記事セクション */}
      <section>
        <h3 className="text-3xl font-semibold mb-4">ジャンルで探す</h3>

        {/* ジャンル選択 */}
        <div className="flex space-x-4 mb-8">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 ${selectedGenre === genre ? 'bg-blue-500 text-white' : 'bg-gray-300'} hover:bg-blue-400 rounded-lg`}
            >
              {genre}
            </button>
          ))}
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 ${selectedGenre === null ? 'bg-blue-500 text-white' : 'bg-gray-300'} hover:bg-blue-400 rounded-lg`}
          >
            すべて
          </button>
        </div>

        {/* ジャンル別カルーセル */}
        <div className="carousel-container" style={{ height: '33vh' }}>
          <Carousel
            showThumbs={false}
            showArrows={true}
            autoPlay
            infiniteLoop
            centerMode
            centerSlidePercentage={33.33}
          >
            {sortedArticles.map((article) => (
              <div
                key={article.id}
                className="p-6 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-all"
                style={{ height: '33vh' }}
              >
                <h4 className="text-2xl font-bold mb-2">{article.title}</h4>
                <p className="text-gray-600">{article.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">ジャンル: {article.genre}</span>
                  <span className="text-sm text-gray-500">👍 {article.likes}</span>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
    </div>
  );
};

export default ArticleListPage;

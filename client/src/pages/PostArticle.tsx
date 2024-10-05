import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import TagInput from '../components/TagInput';  // TagInputをインポート
import { useNavigate } from 'react-router-dom';  // useNavigateをインポート
import '../styles/PostArticle.css';

const PostArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();  // navigateを使う

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      setError('タイトルと内容を入力してください');
      return;
    }

    // 成功時の処理
    setSuccess('記事が正常に投稿されました！');
    setError(null);
  };

  const handlePreview = () => {
    // プレビュー画面に移動し、現在のタイトルとコンテンツを渡す
    navigate('/preview', { state: { title, content } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      {/* タイトル入力と投稿ボタン */}
      <div className="flex justify-between items-center p-4 w-4/5">
        <input
          type="text"
          placeholder="タイトルを入力してください"
          className="w-full text-4xl font-bold p-2 focus:outline-none border-b-2 border-gray-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-4 rounded-lg transition duration-300"
        >
          投稿
        </button>
      </div>

      {/* タグ入力フォームを追加 */}
      <div className="p-2 w-4/5">
        <TagInput />
      </div>

      {/* メイン画像プレビュー */}
      {mainImagePreview && (
        <div className="mb-4 p-4">
          <img src={mainImagePreview} alt="Main Preview" className="w-full h-auto max-h-96 object-cover" />
        </div>
      )}

      {/* TinyMCE Editor */}
      <div className="relative p-4 w-4/5">
        {/* プレビューボタン */}
        <button
          onClick={handlePreview}  // プレビューボタンのクリックイベント
          className="absolute right-6 top-5 z-10 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          プレビュー
        </button>

        <Editor
            apiKey="komrfnvyjfwxrr80b8a2zngekgkrhk7zkic5bg0kfqs9y60y"
            init={{
                height: '100vh',
                width: '100%',
                menubar: false,
                language: 'ja',  // 日本語に設定
                plugins: 'quickbars emoticons lists link image table advlist media fullscreen emoticons wordcount',
                toolbar: 'blocks | bold italic underline | emoticons | hr | alignleft aligncenter alignright | bullist numlist | undo redo | fullscreen | wordcount',
                placeholder: 'ここに記事の内容を入力してください', // プレースホルダーを設定
                content_style: `
                body {
                    background-color: #f0f8ff;
                    font-family: 'Noto Sans', 'Helvetica', Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.8;
                    color: #333;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    border-radius: 8px;
                    border: none;
                }
                h1, h2, h3 {
                    font-weight: bold;
                    margin-top: 1em;
                }
                p {
                    margin-bottom: 1.5em;
                }
                blockquote {
                    background-color: #f1f8e9;
                    border-left: 5px solid #64b5f6;
                    padding: 10px;
                    font-style: italic;
                    margin: 1em 0;
                    color: #7f8c8d;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                th {
                    background-color: #64b5f6;
                    color: white;
                }
                `,
            }}
            value={content}
            onEditorChange={(newContent) => setContent(newContent)}
        />


      </div>

      {/* エラーメッセージと成功メッセージ */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {success && <p className="text-green-500 text-center mt-4">{success}</p>}
    </div>
  );
};

export default PostArticle;

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { motion, useInView } from 'framer-motion';

const Home: React.FC = () => {
  const { token } = useAuth();

  // 各セクションのrefを作成
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);

  // useInViewで中央に来たかを検知
  const isInView1 = useInView(ref1, { margin: '-50% 0px' });
  const isInView2 = useInView(ref2, { margin: '-50% 0px' });
  const isInView3 = useInView(ref3, { margin: '-50% 0px' });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* メイン画像 */}
      <div className="relative flex-1">
        <motion.img
          src="https://via.placeholder.com/1920x1080"
          alt="Nurse working"
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center text-center bg-blue-300 bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2
            className="text-5xl font-bold text-white mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            看護師の知識とスキルを強化するプラットフォーム
          </motion.h2>
          <motion.p
            className="text-lg text-gray-200 mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            成長を楽しみながら、現場に役立つ知識を共有し、キャリアをステップアップ。
          </motion.p>

          {token ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link
                to="/dashboard"
                className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
              >
                ダッシュボードに移動する
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="space-x-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link
                to="/login"
                className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
              >
                ログインして始める
              </Link>
              <Link
                to="/register"
                className="bg-green-400 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
              >
                新規登録
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* メインコンテンツ1 */}
      <motion.div
        ref={ref1}
        className="bg-white py-16"
        initial={{ x: 300, opacity: 0 }}
        animate={isInView1 ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">あなたの学びをサポートする主な機能</h3>
          <p className="text-lg text-gray-700 mb-6">
            看護師としての自己成長をサポートし、現場で即戦力となるスキルを身に付けるためのオンライン学習プラットフォームです。
          </p>
          <ul className="text-left max-w-3xl mx-auto list-disc list-inside text-lg text-gray-700">
            <li className="mb-4">
              <strong>公式提供の100記事以上</strong> - 基礎知識から現場で活かせる実践的なコンテンツを、100記事以上提供します。
            </li>
            <li className="mb-4">
              <strong>経験値とレベルアップ</strong> - 記事を読むたびに経験値がたまり、学習進捗が可視化され、成長が実感できます。
            </li>
            <li className="mb-4">
              <strong>「理解できた」「復習したい」ボタン</strong> - 学習進捗を管理し、学んだ知識を効率的に振り返ることができます。
            </li>
            <li className="mb-4">
              <strong>掲示板機能</strong> - 他の看護師と意見交換ができ、学び合いながら課題を解決できます。
            </li>
            <li className="mb-4">
              <strong>業務改善レポートの共有</strong> - 実際の現場での改善事例を投稿し、他のユーザーが参考にできます。
            </li>
          </ul>
        </div>
      </motion.div>

      {/* メインコンテンツ2 */}
      <motion.div
        ref={ref2}
        className="bg-blue-100 py-16"
        initial={{ x: 300, opacity: 0 }}
        animate={isInView2 ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">なぜこのプラットフォームが効果的か？</h3>
          <ul className="text-left max-w-3xl mx-auto list-disc list-inside text-lg text-gray-700">
            <li className="mb-4">
              <strong>リアルな現場に即した学び</strong> - 現役看護師が執筆した実践的な記事が、即戦力となる知識を提供します。
            </li>
            <li className="mb-4">
              <strong>継続的な自己学習を促進</strong> - 学びの進捗が可視化され、モチベーションを維持しながら学習を続けられます。
            </li>
            <li className="mb-4">
              <strong>業務効率化と質の向上</strong> - 知識を共有し、業務の効率と質の向上を実現します。
            </li>
            <li className="mb-4">
              <strong>コミュニティで支え合い</strong> - 看護師同士が支え合い、成長できる環境を提供します。
            </li>
          </ul>
        </div>
      </motion.div>

      {/* メインコンテンツ3 */}
      <motion.div
        ref={ref3}
        className="bg-white py-16"
        initial={{ x: 300, opacity: 0 }}
        animate={isInView3 ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">あなたのキャリアアップを今すぐ始めましょう！</h3>
          <p className="text-lg text-gray-700 mb-6">
            看護の現場で役立つスキルを身につけ、自己成長を楽しみながらキャリアアップを目指しませんか？今すぐ登録して、最新の知識を手に入れましょう！
          </p>
          {token ? (
            <Link
              to="/dashboard"
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
            >
              ダッシュボードに移動する
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-green-400 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
              >
                新規登録
              </Link>
              <Link
                to="/login"
                className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
              >
                ログインして始める
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* サイト全体リンク集 */}
      <div className="bg-gray-200 py-10">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Link to="/about" className="text-blue-500 hover:underline">私たちについて</Link>
          <Link to="/features" className="text-blue-500 hover:underline">機能紹介</Link>
          <Link to="/pricing" className="text-blue-500 hover:underline">価格</Link>
          <Link to="/contact" className="text-blue-500 hover:underline">お問い合わせ</Link>
          <Link to="/faq" className="text-blue-500 hover:underline">FAQ</Link>
          <Link to="/blog" className="text-blue-500 hover:underline">ブログ</Link>
          <Link to="/careers" className="text-blue-500 hover:underline">採用情報</Link>
          <Link to="/terms" className="text-blue-500 hover:underline">利用規約</Link>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-blue-200 text-white py-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 NurseCareShift. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

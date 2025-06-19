import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useTheme } from './context/ThemeContext';
import { ArrowLeft } from 'lucide-react';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageBase64, moodTag, story } = location.state || {}; // 수정: emotionValue → moodTag
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [poem, setPoem] = useState({ title: '', author: '', poem: '', message: '' });
  const [loading, setLoading] = useState(true);
  const cardRef = useRef();

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#111827' : '#f9fafb';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [isDarkMode]);

  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  function parsePoemResponse(text) {
    const [title, author, ...rest] = text.split('\n');
    const restText = rest.join('\n').trim();

    const parts = restText.split('\n\n');
    const poemRaw = parts[0].replace(/\\n/g, '\n').trim();
    const message = parts[1] ? parts[1].trim() : '';

    return { title, author, poem: poemRaw, message };
  }

  function renderPoemText(text) {
    return text.split('\n').map((line, idx) => (
      <p key={idx} className="mb-2 leading-relaxed select-text">
        {line}
      </p>
    ));
  }

  useEffect(() => {
    if (!imageBase64) {
      navigate('/');
      return;
    }

    async function fetchPoem() {
      setLoading(true);
      try {
        console.log('요청 데이터:', { imageBase64, moodTag, story });

        const res = await axios.post(process.env.REACT_APP_API_URL, {
  imageBase64,
  moodTag,
  story
});
        const parsed = parsePoemResponse(res.data.poem);
        setPoem(parsed);
      } catch {
        alert('시 찾기에 실패했습니다.');
      }
      setLoading(false);
    }

    fetchPoem();
  }, [imageBase64, moodTag, story, navigate]); // 수정: emotionValue → moodTag

  const saveAsImage = () => {
    if (!cardRef.current) return;
    html2canvas(cardRef.current, { scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'poem-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <motion.div
      style={{ minHeight: `${viewportHeight}px` }}
      className={`p-8 flex flex-col items-center justify-center flex-grow transition-colors duration-700 ${
        isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } relative`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div
        className="absolute top-5 right-5 cursor-pointer select-none z-50"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        title="다크 모드 토글"
      >
        <motion.div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shadow-lg"
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </motion.div>
      </div>

      {loading ? (
        <div className="mt-28 flex flex-col items-center">
          <span className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">
            시 찾는 중...
          </span>
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
            />
          </svg>
        </div>
      ) : (
        <motion.div
          className="max-w-3xl w-full bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 shadow-2xl font-noto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <img
            src={imageBase64}
            alt="Uploaded"
            className="w-full rounded-xl object-cover aspect-[16/9] shadow-2xl mb-12 border border-gray-300 dark:border-gray-700"
          />

          <h2 className="text-5xl font-extrabold mb-2 text-indigo-800 dark:text-indigo-300 tracking-wide text-center">
            {poem.title}
          </h2>

          <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-10 text-center">
            {poem.author}
          </h3>

          <div className="mb-10">{renderPoemText(poem.poem)}</div>

          <p className="mt-12 text-lg leading-relaxed font-medium text-gray-700 dark:text-gray-300 select-text text-justify">
            {poem.message}
          </p>

          <div className="flex flex-col sm:flex-row gap-8 w-full max-w-md mx-auto mt-10">
            <button
              onClick={saveAsImage}
              className="flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-3xl shadow-md hover:from-indigo-700 hover:to-purple-800 transition text-xl"
            >
              시 카드 저장하기
            </button>
          </div>

          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            title="뒤로가기"
            className="mt-14 mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg hover:from-indigo-700 hover:to-purple-800 transition"
          >
            <ArrowLeft size={28} />
          </button>
        </motion.div>
      )}

      <div
        ref={cardRef}
        className="absolute left-[-9999px] top-0 w-[700px] h-[900px] overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
      >
        <img
          src={imageBase64}
          alt="Poem Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          style={{ filter: 'blur(15px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-12 py-16 text-white font-noto">
          <span className="absolute top-6 right-6 text-lg font-semibold opacity-80">
            📜 시가 필요할 때
          </span>

          <h2 className="text-5xl font-extrabold mb-4 text-center">{poem.title}</h2>
          <h3 className="text-xl font-medium mb-10 text-center">{poem.author}</h3>
          <div className="text-lg leading-relaxed whitespace-pre-wrap text-center">{poem.poem}</div>
        </div>
      </div>
    </motion.div>
  );
}
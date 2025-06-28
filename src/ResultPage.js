import React, { useEffect, useState, useRef } from 'react';
import ReactGA from 'react-ga4';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useTheme } from './context/ThemeContext';
import { ArrowLeft, Share2, Image as ImageIcon, RefreshCcw, Download } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

function PoemCard({
  useImageBackground,
  imageBase64,
  poem,
  isDarkMode,
  cardRef,
  overlayOpacity,
  textSize,
  selectedGradient,
  setImageLoaded, // pass setImageLoaded as prop
}) {
  const gradientBackground = `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), ${selectedGradient}`;

  return (
    <motion.div
      ref={cardRef}
      className="max-w-[90vw] w-[700px] aspect-[7/9] relative shadow-2xl rounded-none mx-auto overflow-hidden"
      style={{
        background: useImageBackground ? 'black' : gradientBackground,
      }}
    >
      {useImageBackground && imageBase64 && (
        <>
          <div className="absolute inset-0 bg-black" />
          <img
            key={imageBase64}
            src={imageBase64}
            alt="Poem Background"
            crossOrigin="anonymous"
            onLoad={() => setImageLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            style={{ objectPosition: 'center center' }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity * 0.5 }}
          />
        </>
      )}

      <div
        className="absolute bottom-4 right-4 select-none pointer-events-none"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: '600',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.7)',
          userSelect: 'none',
          letterSpacing: '0.05em',
          textTransform: 'lowercase',
        }}
      >
        @poemsfor_everypic
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <TransformWrapper
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          minScale={0.5}
          maxScale={3}
          initialScale={1}
          centerOnInit={false}
          limitToBounds={false}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <motion.div
              className="relative w-full h-full z-10 flex flex-col items-center justify-center text-white font-noto px-6 py-10 sm:px-12 sm:py-16 cursor-move"
              style={{ touchAction: 'none' }}
              whileTap={{ scale: 1.02 }}
            >
              <div
                className="mb-10 leading-relaxed whitespace-pre-wrap drop-shadow-md text-sm sm:text-base"
                style={{
                  fontSize: `${textSize * 0.5}px`,
                  textAlign: 'left',
                  color: 'white',
                  width: '100%',
                  maxWidth: '600px',
                }}
              >
                {poem.poem}
              </div>
              <div
                className="font-extrabold mb-4 text-center drop-shadow-2xl text-3xl sm:text-5xl"
                style={{
                  fontSize: `${textSize*0.5}px`,
                  textAlign: 'left',
                  color: 'white',
                  width: '100%',
                  maxWidth: '600px',
                }}
              >
                - {poem.author}, "{poem.title}"
              </div>
            </motion.div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </motion.div>
  );
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, moodTag, story } = location.state || {};
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [poem, setPoem] = useState({ title: '', author: '', poem: '', message: '',source: '' });
  const [loading, setLoading] = useState(true);
  const cardRef = useRef();

  const [useImageBackground, setUseImageBackground] = useState(Boolean(imageUrl));
  const [imageLoaded, setImageLoaded] = useState(!useImageBackground);

  const gradientOptions = [
    'linear-gradient(135deg, #FFAFBD 0%, #ffc3a0 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
    'linear-gradient(135deg, #9890e3 0%, #b1f4cf 100%)',
    'linear-gradient(135deg, #ebc0fd 0%, #d9ded8 100%)'
  ];

  const getDefaultTextSize = (poemText) => {
    const length = poemText.replace(/\n/g, '').length;
    if (length > 250) return 20;
    if (length > 150) return 30;
    return 40;
  };

  const [textSize, setTextSize] = useState(36);
  const [selectedGradient, setSelectedGradient] = useState(gradientOptions[0]);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#111827' : '';
    document.body.style.overflow = loading ? 'hidden' : 'auto';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.overflow = 'auto';
    };
  }, [isDarkMode, loading]);

  useEffect(() => {
    if (!useImageBackground) {
      setImageLoaded(true);
      return;
    }

    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      if (img.complete) {
        setImageLoaded(true);
      } else {
        img.onload = () => setImageLoaded(true);
      }
    }
  }, [imageUrl, useImageBackground]);

function parsePoemResponse(text) {
  const lines = text.split('\n').map(line => line.trimEnd());

  if (lines.length < 4) return { title: '', author: '', poem: '', message: '', source: '' };

  const title = lines[0];
  const author = lines[1];

  const bodyLines = lines.slice(2);
  console.log('bodyLines:', bodyLines);

  const source = bodyLines.length > 0 ? bodyLines[bodyLines.length - 1].trim() : '';
  console.log('source:', source);

  const bodyText = bodyLines.slice(0, -1).join('\n');

  const paragraphs = bodyText.split(/\n\s*\n/).map(p => p.trim());

  const message = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '';
  const poem = paragraphs.length > 1 ? paragraphs.slice(0, -1).join('\n\n') : paragraphs[0] || '';

  return { title, author, poem, message, source };
}


  useEffect(() => {
    if (!imageUrl && !story.trim() && !moodTag.trim()) {
      navigate('/');
      return;
    }

    async function fetchPoem() {
      console.log('API URL:', process.env.REACT_APP_API_URL);
      setLoading(true);
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/recommend`,
          {
            imageUrl,
            queryText: story,
            moodTag,
          }
        );
        console.log('서버 응답 확인:', res.data);
        try {
          const parsed = parsePoemResponse(res.data.poemText);
          console.log('📦 파싱결과:', parsed);
          setPoem(parsed);
          setTextSize(getDefaultTextSize(parsed.poem));
        } catch (e) {
          console.error('❌ 파싱 중 오류 발생:', e);
        }
      } catch {
        alert('시 찾기에 실패했습니다.');
      }
      setLoading(false);
    }

    fetchPoem();
    ReactGA.event({
      category: 'Poem',
      action: 'Fetched Poem',
      label: moodTag,
    });
  }, [imageUrl, moodTag, story, navigate]);

  const saveAsImage = () => {
    if (!cardRef.current) return;
    ReactGA.event({
      category: 'Poem',
      action: 'Clicked Save Image',
    });
    html2canvas(cardRef.current, { scale: 3, useCORS: true,backgroundColor: null }).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'poem-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const sharePoem = async () => {
    ReactGA.event({
      category: 'Poem',
      action: 'Clicked Share',
    });
    if (navigator.share) {
      try {
        await navigator.share({
          title: '시가 필요할 때',
          url: 'https://photo-poem-frontend.vercel.app/?v=2',
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('공유 중 오류가 발생했습니다.');
        }
      }
    } else {
      alert('공유를 지원하지 않는 브라우저입니다.');
    }
  };

  const loadingMessages = [
  '시 찾는 중... ✨',
  '잠시만 기다려 주세요... ⏳',
  '감성가득 시 고르는 중... 💌',
  '곧 아름다운 시가 도착합니다... 🌸',
  '당신의 순간에 어울리는 시를 찾는 중이에요... 🍃',
  '추억을 감싸는 글귀를 찾고 있어요... 🕊️',
  '시의 결을 따라 마음을 살펴보는 중... 🖋️',
  '감정의 파장을 따라가는 중입니다... 🌊',
  '사진 속 이야기를 시로 엮는 중... 🖼️',
  '당신만을 위한 한 줄을 고르고 있어요... 📖',
];

const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

useEffect(() => {
  if (loading) {
    const interval = setInterval(() => {
      setLoadingMsgIndex(Math.floor(Math.random() * loadingMessages.length));
    }, 3000);
    return () => clearInterval(interval);
  }
}, [loading]);

  return (
    <motion.div
      className={`min-h-screen px-6 py-10 flex flex-col items-center justify-center transition-colors duration-700 ${
        isDarkMode
          ? 'dark bg-gray-900 text-white'
          : 'bg-gradient-to-b from-[#FAF5E4] to-[#FDF6E3] text-black'
      } relative`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* 상단 바 - 좌측 로고, 우측 다크모드 버튼 */}
      <div className="absolute top-2 left-5 right-5 z-50 flex justify-between items-center select-none">
        <span
          className="font-semibold text-sm font-noto cursor-pointer"
          onClick={() => navigate('/')}
        >
          📜 시가 필요할 때
        </span>
        <motion.div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shadow-lg cursor-pointer"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          title="다크 모드 토글"
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </motion.div>
      </div>

      {loading || (useImageBackground && !imageLoaded) ? (
        <>
          {/* 상단 바 - 좌측 로고, 우측 다크모드 버튼 */}
          <div className="absolute top-2 left-5 right-5 z-50 flex justify-between items-center select-none">
            <span
              className="font-semibold text-sm font-noto cursor-pointer"
              onClick={() => navigate('/')}
            >
              📜 시가 필요할 때
            </span>
            <motion.div
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shadow-lg cursor-pointer"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              title="다크 모드 토글"
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </motion.div>
          </div>

          <div
            className="fixed inset-0 flex flex-col items-center justify-center bg-transparent z-40 px-4"
            style={{ overflow: 'hidden', touchAction: 'none' }}
          >
            <span className="text-3xl font-semibold mb-6 text-indigo-700 dark:text-indigo-400 select-none">
              {loadingMessages[loadingMsgIndex]}
            </span>
            <svg
              className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
              />
            </svg>
          </div>
        </>
      ) : (
        <>
          <div className="mt-12">
            <PoemCard
              useImageBackground={useImageBackground}
              imageBase64={imageUrl}
              poem={poem}
              isDarkMode={isDarkMode}
              cardRef={cardRef}
              overlayOpacity={overlayOpacity}
              textSize={textSize}
              selectedGradient={selectedGradient}
              setImageLoaded={setImageLoaded}
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-md mx-auto">
            {imageUrl && (
              <button
                onClick={() => setUseImageBackground(true)}
                className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center transition ${
                  useImageBackground ? 'scale-110 ring-4 ring-indigo-500 bg-indigo-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-500 hover:text-white'
                }`}
                aria-label="사진 배경 선택"
                title="사진 배경 선택"
              >
                <ImageIcon size={20} />
              </button>
            )}

            {gradientOptions.map((gradient, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedGradient(gradient);
                  setUseImageBackground(false);
                }}
                className={`w-12 h-12 rounded-full shadow-md transition-transform duration-200 ${
                  !useImageBackground && selectedGradient === gradient ? 'scale-110 ring-4 ring-indigo-500' : ''
                }`}
                style={{ background: gradient }}
                aria-label={`그라데이션 배경 선택 ${idx + 1}`}
                title={`그라데이션 배경 선택 ${idx + 1}`}
              />
            ))}
          </div>

          <div className="w-full max-w-2xl mt-6 mb-10 flex flex-row justify-center gap-8 items-center">
            <div className="flex flex-col items-center flex-1">
              <label className="mb-2 text-center select-none cursor-pointer text-xl font-noto">🌒</label>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.001}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className={`w-full cursor-pointer slider ${isDarkMode ? 'dark-slider' : 'light-slider'}`}
              />
            </div>

            <div className="flex flex-col items-center flex-1">
              <label className="mb-2 text-center select-none cursor-pointer text-xl font-noto">🔤</label>
              <input
                type="range"
                min={10}
                max={56}
                step={0.1}
                value={textSize}
                onChange={(e) => setTextSize(parseFloat(e.target.value))}
                className={`w-full cursor-pointer slider ${isDarkMode ? 'dark-slider' : 'light-slider'}`}
              />
            </div>
          </div>

          <p className="mt-6 text-lg leading-relaxed font-medium text-gray-700 dark:text-gray-300 select-text text-justify max-w-2xl font-noto">
            {poem.message}
          </p>

<p className="mt-4 text-sm text-gray-500 select-text max-w-2xl font-noto whitespace-pre-wrap">
  ※ 저작권 보호를 위해 시의 일부만 제공되며, 전문은 반드시 출처를 참고하시기 바랍니다.
</p>

<p className="text-sm text-gray-500 mt-2 select-text max-w-2xl font-noto">
  {poem.source}
</p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto mt-10">
            <button
              onClick={saveAsImage}
              className="font-noto flex-1 px-8 py-5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold rounded-3xl shadow-md hover:from-purple-800 hover:to-indigo-700 transition text-xl flex items-center justify-center gap-2"
            >
              <Download size={20} /> 저장하기
            </button>

            <button
              onClick={sharePoem}
              className="font-noto flex-1 px-8 py-5 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold rounded-3xl shadow-md hover:from-purple-800 hover:to-indigo-700 transition text-xl flex items-center justify-center gap-2"
            >
              <Share2 size={20} /> 공유하기
            </button>
          </div>

          <button
            onClick={() => window.location.reload()}
            aria-label="시 다시 찾기"
            title="시 다시 찾기"
            className="font-noto mt-10 mx-auto flex items-center justify-center px-6 py-3 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold shadow-md hover:from-indigo-700 hover:to-purple-800 transition text-xl gap-2 select-none"
          >
            <RefreshCcw size={24} />
            다시 시도
          </button>

          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            title="뒤로가기"
            className="mt-14 mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg hover:from-indigo-700 hover:to-purple-800 transition"
          >
            <ArrowLeft size={28} />
          </button>
        </>
      )}
    </motion.div>
  );
}
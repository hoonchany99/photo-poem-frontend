import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Search } from 'lucide-react';

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState('');
  const [moodTag, setMoodTag] = useState('평온');
  const [story, setStory] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('isDarkMode');
    if (storedMode !== null) return storedMode === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBase64Image(reader.result);
    reader.readAsDataURL(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleGeneratePoem = () => {
    if (!base64Image && !story.trim() && !moodTag.trim()) {
    alert('사진, 사연, 또는 감정을 입력해 주세요.');
    return;
  }
    setLoading(true);
    navigate('/result', {
      state: { imageBase64: base64Image, moodTag, story },
    });
  };

  const moodOptions = ['평온', '기쁨', '슬픔', '분노', '감사', '설렘'];

  return (
    <div
      className={`min-h-screen p-6 ${
         isDarkMode
      ? 'dark bg-gray-900 text-white'
      : 'bg-gradient-to-b from-[#FAF5E4] to-[#FDF6E3] text-black'
      } flex flex-col items-center justify-center relative font-noto`}
    >
      {/* 다크모드 토글 */}
      <div className="absolute top-4 right-4 cursor-pointer select-none" onClick={toggleDarkMode} title="다크 모드 토글">
        <motion.div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shadow-lg"
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </motion.div>
      </div>

      <h1 className="text-4xl font-semibold mb-8 text-center tracking-wide">📜 시가 필요할 때</h1>

      {/* 기분 태그 */}
<div className="w-full max-w-xl mb-6 grid grid-cols-3 grid-rows-2 gap-4 justify-center
                sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
  {moodOptions.map((mood) => (
    <button
      key={mood}
      onClick={() => setMoodTag(mood)}
      className={`px-6 py-2 rounded-3xl font-semibold shadow-md transition-all duration-300 ${
        moodTag === mood
          ? 'bg-indigo-600 text-white scale-105'
          : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105'
      }`}
    >
      {mood}
    </button>
  ))}
</div>


{/* 사연 입력 + 사진 섬네일 + 사진 추가 버튼 영역 */}
{/* 사연 입력 + 사진 섬네일 + 사진 추가 버튼 영역 */}
<div className="w-full max-w-xl mb-8 flex flex-col gap-3">

  {/* 사연 입력창 */}
  <input
    type="text"
    placeholder="짧은 사연이나 사진을 입력해 보세요."
    value={story}
    onChange={(e) => setStory(e.target.value)}
    className={`w-full py-4 px-6 rounded-full border shadow-lg backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 font-noto focus:outline-none focus:ring-4 focus:ring-indigo-400 transition-all
      ${
        isDarkMode
          ? 'border-gray-600 text-white placeholder-gray-400'
          : 'border-gray-300 text-black placeholder-gray-500'
      }
    `}
  />

  {/* 썸네일과 사진 추가 버튼을 한 줄에 묶음 */}
  <div className="flex items-center gap-3">

    {/* 사진 섬네일 (있을 때만) */}
    {selectedImage && (
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md">
        <img
          src={selectedImage}
          alt="Selected thumbnail"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={() => {
            setSelectedImage(null);
            setBase64Image('');
          }}
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black bg-opacity-60 text-white text-xs font-bold hover:bg-opacity-80 transition"
          aria-label="사진 제거"
        >
          ×
        </button>
      </div>
    )}

    {/* 사진 추가 버튼 */}
    <button
      onClick={() => document.getElementById('file-upload').click()}
      className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white shadow-lg flex items-center justify-center"
      aria-label="사진 추가하기"
    >
      <Image size={24} />
    </button>
  </div>
</div>

      <input
        type="file"
        accept="image/*"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 고급스러운 시 찾기 버튼 */}
      <button
        onClick={handleGeneratePoem}
        disabled={loading || (!base64Image && !story.trim() && !moodTag.trim())}
        className="w-44 py-4 rounded-full font-semibold text-white shadow-xl transition bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <svg
            className="animate-spin h-6 w-6 text-white"
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
        ) : (
          <>
            <Search size={20} />
            시 찾기 💫
          </>
        )}
      </button>
    </div>
  );
}
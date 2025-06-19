import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImagePlus, Search } from 'lucide-react';

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState('');
  const [moodTag, setMoodTag] = useState('평온');
  const [story, setStory] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedMode = localStorage.getItem('isDarkMode');
    if (storedMode !== null) {
      setIsDarkMode(storedMode === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', newMode);
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
  const hasImage = typeof base64Image === 'string' && base64Image.trim() !== '';
  const hasStory = story.trim() !== '';

  if (!hasImage && !hasStory) {
    alert('사진 또는 사연 중 하나는 입력해 주세요.');
    return;
  }

  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    navigate('/result', {
      state: { imageBase64: base64Image, moodTag, story },
    });
  }, 500);
};

  const moodOptions = ['평온', '기쁨', '슬픔', '분노', '감사', '설렘'];

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-500 ${
        isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'
      } flex flex-col items-center justify-center relative font-noto`}
    >
      <div
        className="absolute top-4 right-4 cursor-pointer select-none"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        title="다크 모드 토글"
      >
        <motion.div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shadow-md"
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </motion.div>
      </div>

      <h1 className="text-4xl font-semibold font-noto tracking-wide mb-8 text-center">
        📜 시가 필요할 때
      </h1>

      {/* 기분 태그 선택 UI */}
      <div className="w-full max-w-xl mb-4 flex justify-center space-x-4">
        {moodOptions.map((mood) => (
          <button
            key={mood}
            onClick={() => setMoodTag(mood)}
            className={`px-5 py-2 rounded-full font-semibold shadow-md transition ${
              moodTag === mood
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* 사연 쓰기 */}
      <textarea
        placeholder="사진이나 기분을 담은 짧은 사연을 작성해 보세요."
        value={story}
        onChange={(e) => setStory(e.target.value)}
        className={`w-full max-w-xl mb-6 p-4 rounded-lg border ${
          isDarkMode
            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
            : 'border-gray-300 bg-white text-black placeholder-gray-500'
        } resize-none font-noto focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
        rows={4}
      />

      {/* 사진 추가하기 버튼 - 세련된 오렌지/옐로우 컬러 */}
      <input
        type="file"
        accept="image/*"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer mb-6 inline-flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition text-lg select-none"
      >
        <ImagePlus size={24} />
        <span>사진 추가하기</span>
      </label>

      {selectedImage && (
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full max-w-xl mb-8 rounded-lg shadow-lg object-contain"
        />
      )}

      {/* 시 찾기 버튼 - 세련된 퍼플/인디고 컬러 */}
      <button
        onClick={handleGeneratePoem}
        disabled={loading || (!base64Image && !story.trim())}
        className={`w-40 py-3 rounded-xl font-semibold text-white shadow-lg transition flex items-center justify-center space-x-2
          bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800
          disabled:opacity-50 disabled:cursor-not-allowed text-lg`}
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
            <span>시 찾기</span>
          </>
        )}
      </button>
    </div>
  );
}
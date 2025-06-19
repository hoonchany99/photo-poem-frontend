import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState('');
  const [moodTag, setMoodTag] = useState('평온'); // 감정 점수 대신 기분 태그
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
    if (!base64Image) {
      alert('이미지를 먼저 업로드해주세요.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/result', {
        state: { imageBase64: base64Image, moodTag }, // 감정 점수 대신 기분 태그 전달
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

      <input
        type="file"
        accept="image/*"
        id="file-upload"
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer mb-6 inline-block bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 px-8 py-4 rounded-lg text-white font-semibold shadow-lg transition"
      >
        이미지 선택하기
      </label>

      {selectedImage && (
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full max-w-xl mb-8 rounded-lg shadow-lg object-contain"
        />
      )}

      {/* 기분 태그 선택 UI */}
      <div className="w-full max-w-xl mb-4 flex justify-center space-x-4">
        {moodOptions.map((mood) => (
          <button
            key={mood}
            onClick={() => setMoodTag(mood)}
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition ${
              moodTag === mood
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {mood}
          </button>
        ))}
      </div>

      <label
        className={`w-full max-w-xl mb-8 font-semibold text-center ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        선택한 기분: {moodTag}
      </label>

      <button
        onClick={handleGeneratePoem}
        disabled={loading || !base64Image}
        className={`w-56 py-4 rounded-xl font-semibold text-white shadow-lg transition
          bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <svg
            className="animate-spin h-6 w-6 mx-auto text-white"
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
          '시 찾기'
        )}
      </button>
    </div>
  );
}
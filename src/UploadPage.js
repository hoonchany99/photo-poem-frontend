import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Search } from 'lucide-react';
import ReactGA from 'react-ga4';

// 이미지 리사이즈 함수
function resizeImage(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedBase64);
      };

      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

async function resizeIfTooBig(base64Image) {
  const byteSize = Math.ceil((base64Image.length * 3) / 4);
  const MAX_SIZE = 2 * 1024 * 1024;

  if (byteSize > MAX_SIZE) {
    const file = dataURLtoFile(base64Image, 'original.jpg');
    const resized = await resizeImage(file, 1000);
    return resized;
  }

  return base64Image;
}

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [base64Image, setBase64Image] = useState('');
  const [moodTag, setMoodTag] = useState('기쁨');
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedBase64 = await resizeImage(file);
      const finalBase64 = await resizeIfTooBig(resizedBase64);
      const blob = await (await fetch(finalBase64)).blob();
      const finalFile = new File([blob], file.name, { type: 'image/jpeg' });

      setSelectedImage(URL.createObjectURL(finalFile));
      setSelectedImageFile(finalFile);

      ReactGA.event({
        category: 'User',
        action: 'Selected Image',
      });
    } catch (error) {
      alert('이미지 처리 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handleGeneratePoem = async () => {
    if (!selectedImageFile && !story.trim() && !moodTag.trim()) {
      alert('사진, 사연, 또는 감정을 입력해 주세요.');
      return;
    }

    setLoading(true);

    try {
      let publicUrl = null;

      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        formData.append('moodTag', moodTag);
        formData.append('story', story);

        const res = await fetch(`${process.env.REACT_APP_API_URL}/image`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (res.ok) {
          publicUrl = data.publicUrl;
        } else {
          alert('업로드 실패: ' + data.error);
          setLoading(false);
          return;
        }
      }

      ReactGA.event({
        category: 'User',
        action: 'Clicked Generate Poem',
        label: moodTag,
      });

      navigate('/result', {
        state: {
          imageUrl: publicUrl,
          moodTag,
          story,
        },
      });
    } catch (err) {
      alert('에러 발생: ' + err.message);
    }

    setLoading(false);
  };

  const moodOptions = ['기쁨', '사랑', '행복', '감사', '설렘', '위로'];

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode
          ? 'dark bg-gray-900 text-white'
          : 'bg-gradient-to-b from-[#FAF5E4] to-[#FDF6E3] text-black'
      } flex flex-col items-center justify-center relative font-noto`}
    >
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

      <div className="w-full max-w-xl mb-6 grid grid-cols-3 grid-rows-2 gap-4 justify-center sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
        {moodOptions.map((mood) => (
          <button
            key={mood}
            onClick={() => {
              setMoodTag(mood);
              ReactGA.event({
                category: 'User',
                action: 'Selected Mood Tag',
                label: mood,
              });
            }}
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

      <div className="w-full max-w-xl mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder="짧은 사연이나 사진을 입력해 보세요."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className={`flex-grow py-4 px-6 rounded-full border shadow-lg backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 font-noto focus:outline-none focus:ring-4 focus:ring-indigo-400 transition-all ${
            isDarkMode
              ? 'border-gray-600 text-white placeholder-gray-400'
              : 'border-gray-300 text-black placeholder-gray-500'
          }`}
        />

        <div className="flex gap-3 justify-center sm:justify-start mt-3 sm:mt-0">
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
                  setSelectedImageFile(null);
                }}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black bg-opacity-60 text-white text-xs font-bold hover:bg-opacity-80 transition"
                aria-label="사진 제거"
              >
                ×
              </button>
            </div>
          )}

          <button
            onClick={() => document.getElementById('file-upload').click()}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white shadow-lg flex items-center justify-center"
            aria-label="사진 추가하기"
          >
            <ImageIcon size={24} />
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

      <button
        onClick={handleGeneratePoem}
        disabled={loading || (!selectedImage && !story.trim() && !moodTag.trim())}
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
import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AdminPoemForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [source, setSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await axios.post('http://localhost:3001/api/poems', {
        title,
        author,
        excerpt,
        source,
      });

      if (res.data.success) {
        setMessage('✅ 시가 성공적으로 등록되었습니다.');
        setTitle('');
        setAuthor('');
        setExcerpt('');
        setSource('');
      } else {
        setMessage('⚠️ 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ 서버 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-xl mx-auto mt-16 p-8 bg-white shadow-lg rounded-xl"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">✍️ 시 데이터 등록</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-600 font-medium">시 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600 font-medium">시인 이름</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-600 font-medium">시 일부 (한 연)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          ></textarea>
        </div>

        <div>
          <label className="block mb-1 text-gray-600 font-medium">출처</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          {isSubmitting ? '등록 중...' : '저장하기'}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </motion.div>
  );
}
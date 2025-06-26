import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import UploadPage from './UploadPage';
import ResultPage from './ResultPage';
import AdminPoemForm from './PoemDB';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<UploadPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/admin" element={<AdminPoemForm />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
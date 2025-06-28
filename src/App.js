import React from 'react';
import ReactGA from 'react-ga4';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import UploadPage from './UploadPage';
import ResultPage from './ResultPage';
import AdminPoemForm from './PoemDB';

function App() {
  const location = useLocation();

  ReactGA.initialize('G-Z71Q92KRNB'); // Replace with your actual Google Analytics 4 measurement ID
  ReactGA.send('pageview');

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
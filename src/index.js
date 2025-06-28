import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import ReactGA from 'react-ga4';

ReactGA.initialize('G-Z71Q92KRNB'); // 실제 GA4 ID로 바꿔야 함
ReactGA.send('pageview'); // 초기 페이지뷰

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);
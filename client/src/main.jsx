import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/common/ThemeProvider';
import App from './App.jsx';
import './index.css';
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
      <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

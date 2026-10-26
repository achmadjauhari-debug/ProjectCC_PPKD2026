import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap dimuat lebih dulu, lalu tema shadcn/Tailwind
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './VCoE_Full_Interactive_1.jsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

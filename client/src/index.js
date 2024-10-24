import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Fonts from "./assets/fonts/fontFaces";
import Theme from "./assets/commons/Theme";
import { ThemeStore } from "./assets/commons/Theme/store";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Fonts />
    <ThemeStore>
      <Theme>
        <App />
      </Theme>
    </ThemeStore>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

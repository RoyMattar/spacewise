import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Optional CSS file if you have styles
import MyComponent from './MyComponent';  // Adjust if you are using a different component structure

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MyComponent />
  </React.StrictMode>
);

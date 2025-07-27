import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GridEditor from './GridEditor';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GridEditor />} />
        <Route path="/grid-editor" element={<GridEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

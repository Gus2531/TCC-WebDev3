import React from 'react';
import Sidebar from './components/Sidebar';
import Usuario from './components/Usuario';
import Home from './pages/Home';
import Geral from './pages/geral';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="discord"> {/* <--- agrupei tudo em uma div só */}
        <Sidebar />
        <Usuario />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/geral" element={<Geral />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
import React from 'react';
import { VirtualHumanProvider } from './context/VirtualHumanContext';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <VirtualHumanProvider>
      <div className="App">
        <HomePage />
      </div>
    </VirtualHumanProvider>
  );
}

export default App;
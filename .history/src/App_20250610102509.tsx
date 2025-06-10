import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
      <h1>Home Page</h1>
      <p>This is the home route.</p>
      <Link to="/test" style={{ color: '#61dafb' }}>Go to Test Page</Link>
    </div>
  );
}

function Test() {
  return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
      <h1>Test Route</h1>
      <p>This is the /test route.</p>
      <Link to="/" style={{ color: '#61dafb' }}>Back to Home</Link>
    </div>
  );
}

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
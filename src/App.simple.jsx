import React from 'react';
import ReactDOM from 'react-dom/client';

// SIMPLE TEST APP - NO IMPORTS, NO COMPLEXITY
function SimpleApp() {
  return (
    <div style={{ 
      padding: '40px', 
      background: '#1e1e1e', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ color: '#4ade80' }}>✅ REACT IS WORKING!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p>Server: ✅ Running</p>
      <p>React: ✅ Working</p>
      <p style={{ marginTop: '40px', padding: '20px', background: '#333', borderRadius: '8px' }}>
        <strong>If you see this message, the issue is with the main App component.</strong><br/>
        The main app might have an error. Check browser console (F12) for details.
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SimpleApp />);

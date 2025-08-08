import React from 'react';

const Spinner = () => {
  return (
    <div className="spinner-container" data-testid="spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
      
      <style jsx="true">{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        p {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default Spinner;

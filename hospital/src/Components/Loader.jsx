import React from 'react';
import './Loader.css'; // We will create this CSS file next

// Place your hospital logo in the `public/` folder, e.g., `public/hospital-logo.png`
const logoUrl = '/hospital.webp'; 

const HospitalLoader = () => {
  return (
    <div className="hospital-loader-wrapper">
      <div className="hospital-loader-content">
        
        <svg className="ecg-line" width="300" height="100" viewBox="0 0 300 100">
          <polyline
            fill="none"
            stroke="#007bff" 
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="
              10,50 
              60,50 
              80,50 
              90,20 
              100,80 
              110,50 
              130,50 
              200,50 
              210,50 
              220,20 
              230,80 
              240,50 
              260,50 
              290,50
            "
          />
        </svg>

        <p className="loading-text">Loading Medico...</p>
      </div>
    </div>
  );
};

export default HospitalLoader;
import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-bg-container">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
      <div className="bg-grid-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;

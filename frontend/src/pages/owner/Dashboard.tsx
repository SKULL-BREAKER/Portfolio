import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xl)' }}>System Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
        Welcome, Administrator. Secure management interface initialized.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--grid-gap)' }}>
        
        <div className="premium-card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Profile Status</h3>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
            STATUS: ACTIVE<br/>
            VISIBILITY: PUBLIC
          </div>
        </div>

        <div className="premium-card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>System Metrics</h3>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
            Total Projects: [DATA]<br/>
            Certificates: [DATA]<br/>
            Last Login: {new Date().toLocaleDateString()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

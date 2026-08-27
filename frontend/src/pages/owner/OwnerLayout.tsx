import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, User, FolderGit2, Award, Briefcase, GraduationCap, Link as LinkIcon } from 'lucide-react';

const OwnerLayout: React.FC = () => {
  const { logout } = useAuth();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Link to="/" style={{ 
            fontFamily: 'var(--font-mono)', 
            fontWeight: 600,
            fontSize: 'var(--text-lg)'
          }}>
            SYSTEM ADMIN
          </Link>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
          <Link to="/dashboard" className="sidebar-link">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/dashboard/profile" className="sidebar-link">
            <User size={18} /> Profile
          </Link>
          <Link to="/dashboard/projects" className="sidebar-link">
            <FolderGit2 size={18} /> Projects
          </Link>
          <Link to="/dashboard/certificates" className="sidebar-link">
            <Award size={18} /> Certificates
          </Link>
          <Link to="/dashboard/experience" className="sidebar-link">
            <Briefcase size={18} /> Experience
          </Link>
          <Link to="/dashboard/education" className="sidebar-link">
            <GraduationCap size={18} /> Education
          </Link>
          <Link to="/dashboard/links" className="sidebar-link">
            <LinkIcon size={18} /> Social Links
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', gap: '8px', color: '#ff6b6b' }}>
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: 'var(--space-8)', overflowY: 'auto' }}>
        <Outlet />
      </main>
      
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .sidebar-link:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default OwnerLayout;

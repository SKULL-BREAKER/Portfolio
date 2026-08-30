import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/design-system.css';
import VisitorLayout from './pages/visitor/VisitorLayout';
import OwnerLayout from './pages/owner/OwnerLayout';
import Home from './pages/visitor/Home';
import ProfileView from './pages/visitor/ProfileView';
import ProjectsSection from './components/ProjectsSection';
import CertificatesSection from './components/CertificatesSection';
import Dashboard from './pages/owner/Dashboard';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Profile from './pages/owner/Profile';
import Projects from './pages/owner/Projects';
import Certificates from './pages/owner/Certificates';
import Experience from './pages/owner/Experience';
import Education from './pages/owner/Education';
import Links from './pages/owner/Links';

import Landing from './pages/Landing';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Landing Route for SaaS Platform */}
            <Route path="/" element={<Landing />} />

            {/* Visitor Routes (Dynamic by Username) */}
            <Route path="/:username" element={<VisitorLayout />}>
              <Route index element={<Home />} />
              <Route path="profile" element={<ProfileView />} />
              <Route path="products" element={<ProjectsSection />} />
              <Route path="certificates" element={<CertificatesSection />} />
            </Route>

            {/* Auth Route */}
            <Route path="/admin" element={<Login />} />

            {/* Owner Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><OwnerLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="projects" element={<Projects />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="experience" element={<Experience />} />
              <Route path="education" element={<Education />} />
              <Route path="links" element={<Links />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

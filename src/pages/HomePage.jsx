import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHome, FiPieChart, FiActivity, FiLogOut, FiX, FiMenu } from 'react-icons/fi';
import Dashboard from './DashBoard';
import Profile from './Profile';
import Results from './Results';
import Calculate from './Calculate';
import ECalculate from './eeCalculate';
import './HomePage.css';


const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || 'User';
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  
  const getActiveComponent = () => {
    switch(activeTab) {
      case 'profile': return <Profile />;
      case 'results': return <Results />;
      case 'calculate': return <Calculate />;
      case 'eeCalculate': return <ECalculate />;
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={`home-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <aside className={`sidebar ${!isSidebarOpen ? 'hidden' : ''}`}>
        <div className="sidebar-toggle-container">
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebar}
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">
              <FiUser size={20} />
            </span>
            <span>Profile</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">
              <FiHome size={20} />
            </span>
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'calculate' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculate')}
          >
            <span className="nav-icon">
              <FiActivity size={20} />
            </span>
            <span>Calculate MOST</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <span className="nav-icon">
              <FiPieChart size={20} />
            </span>
            <span>Results</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <FiLogOut size={20} />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={`main-content ${!isSidebarOpen ? 'full-width' : ''}`}>
        {!isSidebarOpen && (
          <button 
            className="sidebar-open-btn" 
            onClick={toggleSidebar}
          >
            <FiMenu size={24} />
          </button>
        )}
        {getActiveComponent()}
      </main>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdCalculate, 
  MdShowChart, 
  MdAccessTime
} from 'react-icons/md';
import './DashBoard.css';

const Dashboard = ({ setActiveTab }) => {
  const navigate = useNavigate();

  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="quick-actions-grid">
        <div className="action-card" onClick={() => handleNavigate('calculate')}>
          <h2>CALCULATE MOST</h2>
          <div className="card-content">
            <div className="card-icon">
              <MdCalculate size={32} />
            </div>
            <p>Total Analyses</p>
          </div>
          <button className="card-button">Calculate</button>
        </div>

        <div className="action-card" onClick={() => handleNavigate('results')}>
          <h2>REPORTS</h2>
          <div className="card-content">
            <div className="card-icon">
              <MdAccessTime size={32} />
            </div>
            <p>analyze Results</p>
          </div>
          <button className="card-button">Get Reports</button>
        </div>

        <div className="action-card"  onClick={() => setActiveTab('eeCalculate')}>
          <h2>ADVANCED CALCULATION</h2>
          <div className="card-content">
            <div className="card-icon">
              <MdShowChart size={32} />
            </div>
            <p>Optimization & Suggestions</p>
          </div>
          <button className="card-button">Visit</button>
        </div>
      </div>

      {/* Information Section */}
      <div className="info-container">
  <div className="info-card green-card">
    <h3>What is the MOST Technique?</h3>
    <p>
      <strong>Maynard Operation Sequence Technique (MOST)</strong> is a predetermined motion time system (PMTS) used to analyze and optimize work processes. It breaks tasks into motion elements for better productivity.
    </p>
  </div>

  <div className="info-card yellow-card">
    <h3>Key Features</h3>
    <ul>
      <li>Standardized motion sequences.</li>
      <li>Uses TMU values for task time prediction.</li>
      <li>Optimizes processes and reduces unnecessary movements.</li>
      <li>Applicable across industries like manufacturing and logistics.</li>
    </ul>
  </div>

  <div className="info-card blue-card">
    <h3>Benefits of MOST</h3>
    <p>
      The MOST technique helps industries streamline operations by identifying inefficiencies and optimizing workflows. It ensures resource utilization and cost efficiency.
    </p>
  </div>
</div>

    </div>
  );
};

export default Dashboard;

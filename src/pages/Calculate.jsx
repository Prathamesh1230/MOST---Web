import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import indexedDBService from './IndexedDB';
import './Calculate.css'

const Calculate = () => {
  const [numTasks, setNumTasks] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskNames, setTaskNames] = useState([]);
  const [results, setResults] = useState([]);
  const [showInputs, setShowInputs] = useState(true);
  const [previousResults, setPreviousResults] = useState([]);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const chartRef = useRef(null);
  const comparisonChartRef = useRef(null);

  const handleNumTasksChange = (e) => {
    const value = e.target.value;
    setNumTasks(value);
    setTasks(Array(parseInt(value) || 0).fill(''));
    setTaskNames(Array(parseInt(value) || 0).fill(''));
    setShowInputs(true);
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleTaskNameChange = (index, value) => {
    const newTaskNames = [...taskNames];
    newTaskNames[index] = value;
    setTaskNames(newTaskNames);
  };

  const handleTitleChange = (e) => {
    setAnalysisTitle(e.target.value);
  };

  const captureChart = async () => {
    if (!chartRef.current) return null;
    const canvas = await html2canvas(chartRef.current);
    return canvas.toDataURL('image/png');
  };

  const calculateResults = async (model) => {
    const totalTMU = tasks.reduce((sum, task) => sum + (parseInt(task) || 0), 0);
    const timeInSeconds = totalTMU * 0.036;

    const taskDetails = tasks.map((task, index) => ({
      taskName: taskNames[index] || `Task ${index + 1}`,
      tmu: parseInt(task) || 0,
      seconds: (parseInt(task) || 0) * 0.036
    }));

    const newResult = {
      model,
      totalTMU,
      timeInSeconds,
      timestamp: new Date().toLocaleTimeString(),
      tasks: taskDetails
    };

    setResults(prev => [...prev, newResult]);
    setShowInputs(false);
  };

  const handleSaveResults = async () => {
    if (!chartRef.current || !analysisTitle.trim()) {
      alert('Please provide a title for your analysis before saving.');
      return;
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const chartImage = await captureChart();
      
      const calculationData = {
        userId: user.id,
        title: analysisTitle,
        date: new Date().toISOString(),
        numTasks,
        tasks,
        taskNames,
        results,
        chartImage,
        timestamp: new Date().toLocaleTimeString()
      };

      await indexedDBService.saveCalculation(calculationData);
      alert('Results saved successfully!');
    } catch (error) {
      alert('Error saving results. Please try again.');
    }
  };

  const handleReset = () => {
    setNumTasks('');
    setTasks([]);
    setTaskNames([]);
    setResults([]);
    setShowInputs(true);
    setAnalysisTitle('');
  };

  const handleClearInputs = () => {
    setTasks(Array(parseInt(numTasks) || 0).fill(''));
    setTaskNames(Array(parseInt(numTasks) || 0).fill(''));
    setShowInputs(true);
  };

  return (
    <div className="container">
      <h1 className="title">MOST</h1>
      <br></br>
      <div className="calculator-wrapper">
        <div className="header">
          
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Enter Analysis Title"
            value={analysisTitle}
            onChange={handleTitleChange}
            className="title-input"
          />
          <input
            type="number"
            min="1"
            placeholder="Enter Number of Tasks"
            value={numTasks}
            onChange={handleNumTasksChange}
            className="number-input"
          />
        </div>

        {showInputs && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map((task, index) => (
              <div key={index} className="task-item">
                <input
                  type="text"
                  placeholder={`Task ${index + 1} Name`}
                  value={taskNames[index]}
                  onChange={(e) => handleTaskNameChange(index, e.target.value)}
                  className="task-name-input"
                />
                <input
                  type="number"
                  placeholder="TMU"
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  className="tmu-input"
                />
              </div>
            ))}
          </div>
        )}

        <div className="button-grid">
          <button 
            onClick={() => calculateResults('General Model')}
            disabled={!tasks.length || !tasks.some(t => t !== '')}
            className="primary-button"
          >
            General Model
          </button>
          <button 
            onClick={() => calculateResults('Controlled Model')}
            disabled={!tasks.length || !tasks.some(t => t !== '')}
            className="primary-button"
          >
            Controlled Model
          </button>
          <button 
            onClick={() => calculateResults('Tools Model')}
            disabled={!tasks.length || !tasks.some(t => t !== '')}
            className="primary-button"
          >
            Tools Model
          </button>
        </div>

        <div className="button-grid">
          <button onClick={handleReset} className="secondary-button">Reset All</button>
          <button onClick={handleClearInputs} disabled={!numTasks} className="secondary-button">Clear Inputs</button>
        </div>

        {results.length > 0 && (
          <div className="results-section">
            <h3 className="results-title">Calculation History:</h3>
            <div className="chart-container" ref={chartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results.map(r => ({
                  name: `${r.model} (${r.timestamp})`,
                  TMU: r.totalTMU,
                  Seconds: r.timeInSeconds
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="TMU" stroke="#2563eb" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Seconds" stroke="#10b981" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <button 
              onClick={handleSaveResults} 
              className="save-button"
              disabled={!analysisTitle.trim()}
            >
              Save Results
            </button>

            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <h4 className="result-model">{result.model}</h4>
                    <span className="result-timestamp">{result.timestamp}</span>
                  </div>
                  <div className="result-details">
                    <p className="result-text">Total TMU: {result.totalTMU.toFixed(2)}</p>
                    <p className="result-text">Time in Seconds: {result.timeInSeconds.toFixed(2)}</p>
                    <div className="task-details">
                      {result.tasks.map((task, taskIndex) => (
                        <p key={taskIndex} className="task-detail">
                          {task.taskName}: {task.tmu} TMU ({task.seconds.toFixed(2)} seconds)
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculate;
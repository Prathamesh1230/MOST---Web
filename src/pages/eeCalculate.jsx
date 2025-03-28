import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import indexedDBService from './IndexedDB';
import './eeCalculate.css';

const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const MOSTAnalyzer = () => {
  const [numTasks, setNumTasks] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskNames, setTaskNames] = useState([]);
  const [results, setResults] = useState([]);
  const [mlPredictions, setMLPredictions] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const chartRef = useRef(null);

  const convertTMUToSeconds = (tmu) => tmu * 0.036;

  const performMLAnalysis = (taskData) => {
    const baselineTMU = taskData.reduce((sum, task) => sum + task.tmu, 0);
    const baselineSeconds = convertTMUToSeconds(baselineTMU);
    
    const patterns = {
      repetitive: 0,
      highTMU: 0,
      inefficientSequence: 0
    };

    taskData.forEach((task, index) => {
      if (index > 0) {
        const prevTask = taskData[index - 1];
        if (Math.abs(task.tmu - prevTask.tmu) < 2) {
          patterns.repetitive++;
        }
      }
      
      if (task.tmu > 50) {
        patterns.highTMU++;
      }
      
      if (index < taskData.length - 1) {
        const nextTask = taskData[index + 1];
        if (task.tmu + nextTask.tmu > 70) {
          patterns.inefficientSequence++;
        }
      }
    });

    const optimizationScore = 1 - (
      (patterns.repetitive * 0.2 + 
       patterns.highTMU * 0.3 + 
       patterns.inefficientSequence * 0.25) / taskData.length
    );

    const predictedOptimization = baselineTMU * (1 - (1 - optimizationScore) * 0.3);
    const optimizedSeconds = convertTMUToSeconds(predictedOptimization);

    return {
      originalTMU: baselineTMU,
      optimizedTMU: predictedOptimization,
      originalSeconds: baselineSeconds,
      optimizedSeconds: optimizedSeconds,
      improvementPercentage: ((baselineTMU - predictedOptimization) / baselineTMU * 100).toFixed(1),
      patterns,
      optimizationScore: optimizationScore.toFixed(2)
    };
  };

  const generateSuggestions = (taskData, mlResults) => {
    const suggestions = [];
    
    taskData.forEach((task, index) => {
      if (index > 0) {
        const prevTask = taskData[index - 1];
        if (Math.abs(task.tmu - prevTask.tmu) < 2) {
          suggestions.push({
            type: 'combine',
            tasks: [prevTask.name, task.name],
            potentialSaving: task.tmu * 0.2,
            potentialSavingSeconds: convertTMUToSeconds(task.tmu * 0.2),
            priority: 'high'
          });
        }
      }
      
      if (task.tmu > 50) {
        suggestions.push({
          type: 'split',
          task: task.name,
          potentialSaving: task.tmu * 0.3,
          potentialSavingSeconds: convertTMUToSeconds(task.tmu * 0.3),
          priority: 'medium'
        });
      }
      
      if (index < taskData.length - 1) {
        const nextTask = taskData[index + 1];
        if (task.tmu + nextTask.tmu > 70) {
          suggestions.push({
            type: 'reorder',
            tasks: [task.name, nextTask.name],
            potentialSaving: (task.tmu + nextTask.tmu) * 0.15,
            potentialSavingSeconds: convertTMUToSeconds((task.tmu + nextTask.tmu) * 0.15),
            priority: 'low'
          });
        }
      }
    });

    return suggestions;
  };

  const generatePDF = async (chartImage, taskData, mlResults, suggestions) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    pdf.addFont('helvetica', 'normal');
    pdf.addFont('helvetica', 'bold');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text('MOST Time Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(18);
    pdf.text(analysisTitle || 'Untitled Analysis', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Task Details:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    taskData.forEach((task, index) => {
      pdf.text(`${index + 1}. ${task.name}: ${task.tmu} TMU (${convertTMUToSeconds(task.tmu).toFixed(2)} seconds)`, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 10;
    const imgWidth = pageWidth - (2 * margin);
    const imgHeight = (imgWidth * 9) / 16;
    pdf.addImage(chartImage, 'PNG', margin, yPosition, imgWidth, imgHeight);
    yPosition += imgHeight + 15;

    if (yPosition + 60 > pageHeight) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Analysis Results:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text([
      `Original TMU: ${mlResults.originalTMU.toFixed(1)}`,
      `Optimized TMU: ${mlResults.optimizedTMU.toFixed(1)}`,
      `Original Seconds: ${mlResults.originalSeconds.toFixed(2)}`,
      `Optimized Seconds: ${mlResults.optimizedSeconds.toFixed(2)}`,
      `Improvement: ${mlResults.improvementPercentage}%`,
      `Optimization Score: ${mlResults.optimizationScore}`
    ], margin, yPosition);
    yPosition += 45;

    if (yPosition + 60 > pageHeight) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Optimization Suggestions:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    suggestions.forEach((suggestion, index) => {
      const suggestionText = suggestion.type === 'combine' 
        ? `Combine "${suggestion.tasks[0]}" and "${suggestion.tasks[1]}"`
        : suggestion.type === 'split'
        ? `Split "${suggestion.task}" into smaller tasks`
        : `Reorder "${suggestion.tasks[0]}" and "${suggestion.tasks[1]}"`;

      pdf.text(`${index + 1}. ${suggestionText}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`   Potential saving: ${suggestion.potentialSaving.toFixed(1)} TMU (${suggestion.potentialSavingSeconds.toFixed(2)} seconds)`, margin, yPosition);
      yPosition += 10;
    });

    return pdf;
  };

  const handleSaveAnalysis = async () => {
    if (!chartRef.current) return;

    try {
      const chartImage = await html2canvas(chartRef.current);
      const imageData = chartImage.toDataURL('image/png');

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        alert('Please log in to save analysis');
        return;
      }

      const taskData = tasks.map((tmu, index) => ({
        name: taskNames[index] || `Task ${index + 1}`,
        tmu: parseFloat(tmu) || 0
      }));

      const pdf = await generatePDF(imageData, taskData, mlPredictions, optimizationSuggestions);
      const pdfData = pdf.output('datauristring');

      const analysisData = {
        userId: user.id,
        title: analysisTitle || 'Untitled Analysis',
        date: new Date().toISOString(),
        chartImage: imageData,
        pdfData: pdfData,
        taskData: tasks,
        taskNames: taskNames,
        mlResults: mlPredictions,
        suggestions: optimizationSuggestions
      };

      await indexedDBService.saveCalculation(analysisData);
      alert('Analysis saved successfully!');
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error saving analysis. Please try again.');
    }
  };

  const handleNumTasksChange = (e) => {
    const value = e.target.value;
    setNumTasks(value);
    setTasks(Array(parseInt(value) || 0).fill(''));
    setTaskNames(Array(parseInt(value) || 0).fill(''));
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

  const calculateResults = () => {
    const taskData = tasks.map((tmu, index) => ({
      name: taskNames[index] || `Task ${index + 1}`,
      tmu: parseFloat(tmu) || 0
    }));

    const mlResults = performMLAnalysis(taskData);
    const suggestions = generateSuggestions(taskData, mlResults);

    setMLPredictions(mlResults);
    setOptimizationSuggestions(suggestions);
    setResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      taskData,
      mlResults,
      suggestions
    }]);
  };

  return (
    <div className="container">
       <Brain className="w-6 h-6"/>
       <h1 className="title">MOST Calculation (Advanced)</h1>
      <br></br>
      <Card>
      

        <div className="form-container">
          <input
            type="text"
            placeholder="Analysis Title"
            value={analysisTitle}
            onChange={(e) => setAnalysisTitle(e.target.value)}
            className="input"
          />
          
          <input
            type="number"
            min="1"
            placeholder="Number of Tasks"
            value={numTasks}
            onChange={handleNumTasksChange}
            className="input"
          />
          
          {tasks.map((task, index) => (
            <div key={index} className="task-input-group">
              <input
                type="text"
                placeholder={`Task ${index + 1} Name`}
                value={taskNames[index]}
                onChange={(e) => handleTaskNameChange(index, e.target.value)}
                className="input task-name-input"
              />
              <input
                type="number"
                placeholder="TMU"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                className="input tmu-input"
              />
            </div>
          ))}
          
          <button
            onClick={calculateResults}
            className="button"
            disabled={!tasks.some(t => t !== '')}
          >
            Analyze and Optimize
          </button>
        </div>
      </Card>

      {mlPredictions && (
        <Card>
          <div ref={chartRef}>
            <div className="header">
              <TrendingUp className="w-6 h-6" />
              <h2 className="subtitle">ML Optimization Results</h2>
            </div>

            <div className="flex justify-between gap-4 mb-6">
              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Current Values</h3>
                <p className="text-gray-700">
                  TMU: {mlPredictions.originalTMU.toFixed(1)}
                  <br />
                  Seconds: {mlPredictions.originalSeconds.toFixed(2)}
                </p>
              </div>
              
              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Optimized Values</h3>
                <p className="text-gray-700">
                  TMU: {mlPredictions.optimizedTMU.toFixed(1)}
                  <br />
                  Seconds: {mlPredictions.optimizedSeconds.toFixed(2)}
                </p>
              </div>
              
              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Analysis Metrics</h3>
                <p className="text-gray-700">
                  Improvement: {mlPredictions.improvementPercentage}%
                  <br />
                  Score: {mlPredictions.optimizationScore}
                </p>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={[{
                  name: 'Current vs Optimized',
                  currentTMU: mlPredictions.originalTMU,
                  optimizedTMU: mlPredictions.optimizedTMU,
                  currentSeconds: mlPredictions.originalSeconds,
                  optimizedSeconds: mlPredictions.optimizedSeconds
                }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="currentTMU" fill="#4f46e5" name="Current TMU" />
                  <Bar yAxisId="left" dataKey="optimizedTMU" fill="#10b981" name="Optimized TMU" />
                  <Bar yAxisId="right" dataKey="currentSeconds" fill="#6366f1" name="Current Seconds" />
                  <Bar yAxisId="right" dataKey="optimizedSeconds" fill="#34d399" name="Optimized Seconds" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="suggestions-container">
              {optimizationSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-card ${suggestion.priority}`}
                >
                  <div className="suggestion-header">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="suggestion-title">
                      {suggestion.type === 'combine' ? 'Combine Tasks' :
                       suggestion.type === 'split' ? 'Split Task' : 'Reorder Tasks'}
                    </h4>
                  </div>
                  <p className="suggestion-content">
                    {suggestion.type === 'combine' ? 
                      `Consider combining "${suggestion.tasks[0]}" and "${suggestion.tasks[1]}"` :
                     suggestion.type === 'split' ?
                      `Consider breaking down "${suggestion.task}" into smaller tasks` :
                      `Consider reordering "${suggestion.tasks[0]}" and "${suggestion.tasks[1]}"`}
                  </p>
                  <p className="suggestion-savings">
                    Potential saving: {suggestion.potentialSaving.toFixed(1)} TMU ({suggestion.potentialSavingSeconds.toFixed(2)} seconds)
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveAnalysis}
            className="button flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            Save Analysis
          </button>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <h2 className="subtitle">Analysis History</h2>
          <div className="chart-container">
            <ResponsiveContainer>
              <LineChart data={results.map(r => ({
                name: new Date(r.timestamp).toLocaleTimeString(),
                originalTMU: r.mlResults.originalTMU,
                optimizedTMU: r.mlResults.optimizedTMU,
                originalSeconds: r.mlResults.originalSeconds,
                optimizedSeconds: r.mlResults.optimizedSeconds
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="originalTMU" stroke="#4f46e5" name="Original TMU" />
                <Line yAxisId="left" type="monotone" dataKey="optimizedTMU" stroke="#10b981" name="Optimized TMU" />
                <Line yAxisId="right" type="monotone" dataKey="originalSeconds" stroke="#6366f1" name="Original Seconds" />
                <Line yAxisId="right" type="monotone" dataKey="optimizedSeconds" stroke="#34d399" name="Optimized Seconds" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MOSTAnalyzer;
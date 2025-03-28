import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import indexedDBService from './IndexedDB';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import './result.css';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPdf, setSelectedPdf] = useState({ url: null, title: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setError('No user logged in');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        let data;
        if (selectedDate) {
          const startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(selectedDate);
          endDate.setHours(23, 59, 59, 999);

          data = await indexedDBService.getCalculationsByDate(
            user.id,
            startDate.toISOString(),
            endDate.toISOString()
          );
        } else {
          data = await indexedDBService.getCalculationsByUserId(user.id);
        }
        setResults(data);
      } catch (err) {
        setError('Error fetching results: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleClearDate = () => {
    setSelectedDate('');
  };

  const handleDeleteChart = async (id) => {
    try {
      await indexedDBService.deleteCalculation(id);
      setResults(prev => prev.filter(result => result.id !== id));
      alert('Chart deleted successfully!');
    } catch (error) {
      console.error('Error deleting chart:', error);
      alert('Error deleting chart. Please try again.');
    }
  };

  const base64ToBlob = (base64Data) => {
    const pdfDataWithoutPrefix = base64Data.replace(/^data:application\/pdf;base64,/, '');
    
    try {
      const byteCharacters = atob(pdfDataWithoutPrefix);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: 'application/pdf' });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      return null;
    }
  };

  const handleDownloadPDF = (pdfData, title) => {
    try {
      const blob = base64ToBlob(pdfData);
      if (!blob) {
        throw new Error('Failed to create PDF blob');
      }

      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `${title || 'MOST-Time-Analysis'}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const handleViewPDF = (pdfData, title) => {
    try {
      if (!pdfData) {
        throw new Error('No PDF data available');
      }

      let pdfUrl;
      if (pdfData.startsWith('data:application/pdf')) {
        pdfUrl = pdfData;
      } else {
        const blob = base64ToBlob(pdfData);
        if (!blob) {
          throw new Error('Failed to create PDF blob');
        }
        pdfUrl = URL.createObjectURL(blob);
      }

      setSelectedPdf({ url: pdfUrl, title });
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Error viewing PDF. Please try again.');
    }
  };

  const closePdfViewer = () => {
    if (selectedPdf.url && !selectedPdf.url.startsWith('data:')) {
      URL.revokeObjectURL(selectedPdf.url);
    }
    setSelectedPdf({ url: null, title: '' });
  };

  useEffect(() => {
    return () => {
      if (selectedPdf.url && !selectedPdf.url.startsWith('data:')) {
        URL.revokeObjectURL(selectedPdf.url);
      }
    };
  }, [selectedPdf.url]);

  if (loading) return <div className="loading">Loading analyses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="results-container">
      <h2>Analysis Results</h2>
      
      <div className="filters">
        <div className="date-filter-container">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-filter"
          />
          {selectedDate && (
            <button className="clear-date" onClick={handleClearDate}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      
      <div className="analyses-grid">
        {results.length === 0 ? (
          <div className="no-results">No analyses found for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'any date'}.</div>
        ) : (
          results.map((result) => (
            <div key={result.id} className="analysis-card">
              <div className="analysis-header">
                <h3>{result.title || 'Untitled Analysis'}</h3>
                <span>{new Date(result.date).toLocaleDateString()}</span>
              </div>
              
              <div className="chart-preview">
                <img src={result.chartImage} alt="Analysis Chart" />
              </div>

              <div className="button-group">
                
                <button
                  className="download-btn"
                  onClick={() => handleDownloadPDF(result.pdfData, result.title)}
                >
                  <FontAwesomeIcon icon={faDownload} /> Download
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteChart(result.id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Results;
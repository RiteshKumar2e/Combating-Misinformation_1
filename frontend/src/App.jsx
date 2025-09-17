import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // State management
  const [currentPage, setCurrentPage] = useState('home');
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');
  const [isConnected, setIsConnected] = useState(false);
  const [showBackendConfig, setShowBackendConfig] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('basic');
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    headline: '',
    text: '',
    url: ''
  });
  
  // Results state
  const [analysisResults, setAnalysisResults] = useState(null);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
    setupEventListeners();
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeApp = () => {
    // Load saved backend URL
    const savedUrl = localStorage.getItem('backendUrl');
    if (savedUrl) {
      setBackendUrl(savedUrl);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  };

  const setupEventListeners = () => {
    // Theme initialization
    document.documentElement.setAttribute('data-theme', currentTheme);
  };

  // Backend status check
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/status`, {
        method: 'GET'
      });
      
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    }
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Backend configuration
  const saveBackendConfig = () => {
    localStorage.setItem('backendUrl', backendUrl);
    setShowBackendConfig(false);
    checkBackendStatus();
  };

  // Analysis functions
  const loadExample = () => {
    setFormData({
      headline: 'Scientists Discover Breakthrough in Climate Change Research',
      text: 'Recent studies conducted by international researchers have shown promising results in carbon capture technology. The new method can potentially reduce atmospheric CO2 by 15% within the next decade, according to peer-reviewed research published in Nature Climate Change journal.',
      url: 'https://example-news.com/climate-breakthrough'
    });
  };

  const clearForm = () => {
    setFormData({
      headline: '',
      text: '',
      url: ''
    });
    setAnalysisResults(null);
    setShowResults(false);
  };

  const analyze = async () => {
    if (!formData.text.trim()) {
      alert('Please enter content to analyze.');
      return;
    }

    if (!isConnected) {
      alert('Backend is not connected. Please configure the backend URL.');
      setShowBackendConfig(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      const requestData = {
        text: formData.text,
        headline: formData.headline,
        url: formData.url,
        mode: analysisMode
      };

      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResults(result);
      setShowResults(true);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResults({
        error: 'Failed to analyze content. Please check your backend connection.'
      });
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Contact form handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Backend is not connected. Please try again later.');
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Message sent successfully!');
        e.target.reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch {
      alert('Failed to send message. Please try again later.');
    }
  };

  const showDemo = () => {
    alert('Demo feature coming soon! This will show a video demonstration of the platform capabilities.');
  };

  // Results display component
  const ResultsDisplay = () => {
    if (!showResults || !analysisResults) return null;

    if (analysisResults.error) {
      return (
        <div className="results-section show">
          <div className="results-card" style={{borderLeft: '4px solid #ef4444'}}>
            <h3 style={{color: '#ef4444'}}>Analysis Error</h3>
            <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>
              {analysisResults.error}
            </p>
            <div style={{marginTop: '1rem'}}>
              <button className="btn-secondary" onClick={() => setShowBackendConfig(true)}>
                Configure Backend
              </button>
              <button className="btn-secondary" onClick={checkBackendStatus} style={{marginLeft: '1rem'}}>
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      );
    }

    const score = analysisResults.credibility_score || 0.5;
    const scoreClass = score >= 0.7 ? 'score-high' : score >= 0.4 ? 'score-medium' : 'score-low';
    const scoreLabel = score >= 0.7 ? 'Highly Credible' : score >= 0.4 ? 'Moderately Credible' : 'Low Credibility';

    return (
      <div className="results-section show">
        <div className="results-card">
          <h3>Analysis Results</h3>
          <div className="credibility-score">
            <div>
              <h4>Overall Credibility Score</h4>
              <p style={{color: 'var(--text-secondary)'}}>{scoreLabel}</p>
            </div>
            <div className={`score-circle ${scoreClass}`}>
              {Math.round(score * 100)}%
            </div>
          </div>
          
          <div className="analysis-details">
            <h4>Analysis Details</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
              <div className="detail-item">
                <strong>Bias Score:</strong> {analysisResults.analysis?.bias_score || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Confidence:</strong> {analysisResults.analysis?.confidence || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Sources Checked:</strong> {analysisResults.analysis?.sources_found?.length || 0}
              </div>
              <div className="detail-item">
                <strong>Fact Checks:</strong> {analysisResults.analysis?.fact_check_results?.length || 0}
              </div>
            </div>
            
            {analysisResults.analysis?.summary && (
              <div style={{marginTop: '1.5rem'}}>
                <h5>Summary</h5>
                <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
                  {analysisResults.analysis.summary}
                </p>
              </div>
            )}
            
            {analysisResults.analysis?.recommendations && (
              <div style={{marginTop: '1.5rem'}}>
                <h5>Recommendations</h5>
                <ul style={{color: 'var(--text-secondary)', marginTop: '0.5rem', paddingLeft: '1.5rem'}}>
                  {analysisResults.analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {/* Professional Navigation */}
      <nav className="professional-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-icon">🛡️</div>
            <div className="brand-text">
              <h1>Misinformation Guard</h1>
              <span>Professional Fact-Checking Platform</span>
            </div>
          </div>
          
          <div className="nav-menu">
            <a href="#" className={`nav-item ${currentPage === 'home' ? 'active' : ''}`} 
               onClick={() => setCurrentPage('home')}>Home</a>
            <a href="#" className={`nav-item ${currentPage === 'analyze' ? 'active' : ''}`} 
               onClick={() => setCurrentPage('analyze')}>Analyze</a>
            <a href="#" className={`nav-item ${currentPage === 'about' ? 'active' : ''}`} 
               onClick={() => setCurrentPage('about')}>About</a>
            <a href="#" className={`nav-item ${currentPage === 'api' ? 'active' : ''}`} 
               onClick={() => setCurrentPage('api')}>API</a>
            <a href="#" className={`nav-item ${currentPage === 'contact' ? 'active' : ''}`} 
               onClick={() => setCurrentPage('contact')}>Contact</a>
          </div>
          
          <div className="nav-actions">
            <button className="btn-secondary" onClick={toggleTheme}>
              {currentTheme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="btn-primary" onClick={() => setCurrentPage('analyze')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="page-container">
        {/* Home Page */}
        {currentPage === 'home' && (
          <div className="page active">
            <section className="hero-section">
              <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
              </div>
              
              <div className="hero-content">
                <div className="hero-text">
                  <h1 className="hero-title">
                    Combat Misinformation with
                    <span className="gradient-text"> AI-Powered Analysis</span>
                  </h1>
                  <p className="hero-subtitle">
                    Advanced fact-checking platform combining NLP analysis, real-time verification, 
                    and comprehensive credibility scoring for reliable information assessment.
                  </p>

                  <div className="hero-stats">
                    <div className="stat-item">
                      <div className="stat-number">150+</div>
                      <div className="stat-label">Fact-Check Sources</div>
                    </div>
                  </div>
                  
                  <div className="hero-actions">
                    <button className="btn-hero-primary" onClick={() => setCurrentPage('analyze')}>
                      Start Analysis
                      <span className="btn-arrow">→</span>
                    </button>
                    <button className="btn-hero-secondary" onClick={showDemo}>
                      Watch Demo
                      <span className="play-icon">▶</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Analyze Page */}
        {currentPage === 'analyze' && (
          <div className="page active">
            <section className="analysis-section">
              <div className="section-container">
                <div className="section-header">
                  <h2 className="section-title">Content Analysis Platform</h2>
                  <p className="section-subtitle">
                    Upload content, images, or provide URLs for comprehensive fact-checking and credibility analysis
                  </p>
                </div>

                <div className="analysis-card">
                  <div className="card-header">
                    <h3>Analyze Content Credibility</h3>
                    <div className="analysis-mode-toggle">
                      <button 
                        className={`mode-btn ${analysisMode === 'basic' ? 'active' : ''}`}
                        onClick={() => setAnalysisMode('basic')}
                      >
                        Basic Analysis
                      </button>
                      <button 
                        className={`mode-btn ${analysisMode === 'advanced' ? 'active' : ''}`}
                        onClick={() => setAnalysisMode('advanced')}
                      >
                        Advanced AI
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="input-grid">
                      <div className="input-group">
                        <label className="input-label">
                          <span className="label-icon">📰</span>
                          Headline (Optional)
                        </label>
                        <input 
                          id="headline"
                          className="professional-input" 
                          placeholder="Enter article headline or claim title..."
                          maxLength="200"
                          value={formData.headline}
                          onChange={handleInputChange}
                        />
                        <div className="input-counter">
                          <span>{formData.headline.length}</span>/200
                        </div>
                      </div>
                      
                      <div className="input-group full-width">
                        <label className="input-label">
                          <span className="label-icon">📝</span>
                          Content Text
                          <span className="required">*</span>
                        </label>
                        <textarea 
                          id="text"
                          className="professional-textarea" 
                          placeholder="Paste article text, social media post, or claim to analyze..."
                          maxLength="5000"
                          value={formData.text}
                          onChange={handleInputChange}
                        />
                        <div className="input-counter">
                          <span>{formData.text.length}</span>/5000
                        </div>
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">
                          <span className="label-icon">🔗</span>
                          Source URL (Optional)
                        </label>
                        <input 
                          id="url"
                          className="professional-input" 
                          placeholder="https://example.com/article..."
                          type="url"
                          value={formData.url}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="analysis-controls">
                      <div className="action-buttons" style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem'}}>
                        <button className="btn-secondary" onClick={loadExample}>
                          📄 Load Example
                        </button>
                        <button className="btn-secondary" onClick={clearForm}>
                          🗑️ Clear All
                        </button>
                        <button className="btn-primary analyze-btn" onClick={analyze} disabled={isAnalyzing}>
                          <span className="btn-icon">🔍</span>
                          {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
                          {isAnalyzing && (
                            <div className="btn-loading">
                              <div className="loading-spinner"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <ResultsDisplay />
              </div>
            </section>
          </div>
        )}

        {/* About Page */}
        {currentPage === 'about' && (
          <div className="page active">
            <div className="about-content">
              <h2>About Misinformation Guard</h2>
              <p>
                Misinformation Guard is a cutting-edge AI-powered fact-checking platform designed to combat the spread 
                of misinformation across digital media. Our advanced algorithms analyze content using natural language 
                processing, cross-reference multiple trusted sources, and provide comprehensive credibility assessments.
              </p>
              <p>
                Built with state-of-the-art machine learning models, our platform offers real-time analysis of text, 
                images, and multimedia content. We integrate with over 150 fact-checking organizations and verification 
                sources to ensure comprehensive coverage and accuracy.
              </p>
              <h3>Key Features:</h3>
              <ul style={{color: 'var(--text-secondary)', margin: '1rem 0', paddingLeft: '2rem'}}>
                <li>AI-powered natural language processing</li>
                <li>Real-time fact verification</li>
                <li>Visual content analysis</li>
                <li>Multi-source credibility scoring</li>
                <li>API integration capabilities</li>
              </ul>
              <p>
                Our mission is to provide accessible, accurate, and unbiased fact-checking tools that empower users 
                to make informed decisions about the information they consume and share.
              </p>
            </div>
          </div>
        )}

        {/* API Page */}
        {currentPage === 'api' && (
          <div className="page active">
            <div className="api-content">
              <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>API Documentation</h2>
              
              <div className="endpoint-card">
                <div className="endpoint-header">
                  <span className="method-badge method-post">POST</span>
                  <h3>/api/analyze</h3>
                </div>
                <p>Analyze content for misinformation and credibility scoring.</p>
                
                <h4>Request Body:</h4>
                <div className="code-block">
{`{
  "text": "Content to analyze",
  "headline": "Optional headline",
  "url": "Optional source URL",
  "mode": "basic|advanced"
}`}
                </div>
                
                <h4>Response:</h4>
                <div className="code-block">
{`{
  "credibility_score": 0.85,
  "analysis": {
    "bias_score": 0.2,
    "fact_check_results": [...],
    "sources_found": [...],
    "confidence": 0.92
  }
}`}
                </div>
              </div>

              <div className="endpoint-card">
                <div className="endpoint-header">
                  <span className="method-badge method-get">GET</span>
                  <h3>/api/status</h3>
                </div>
                <p>Check API health and status.</p>
                
                <h4>Response:</h4>
                <div className="code-block">
{`{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400
}`}
                </div>
              </div>

              <div className="endpoint-card">
                <h3>Authentication</h3>
                <p>Include your API key in the Authorization header:</p>
                <div className="code-block">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </div>

              <div className="endpoint-card">
                <h3>Python Example</h3>
                <div className="code-block">
{`import requests

url = "http://localhost:8000/api/analyze"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
data = {
    "text": "Your content here",
    "mode": "advanced"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(f"Credibility Score: {result['credibility_score']}")`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Page */}
{currentPage === 'contact' && (
  <div className="page active contact-page">
    <div className="contact-container">
      
      {/* Page Title */}
      <h2 className="contact-title">Contact Us</h2>
      
      {/* Contact Card (Form + Info together) */}
      <div className="contact-card">
        
        {/* Contact Form */}
        <form onSubmit={handleContactSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="contactName">Name <span className="required">*</span></label>
            <input type="text" id="contactName" name="name" placeholder="Enter your full name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="contactEmail">Email <span className="required">*</span></label>
            <input type="email" id="contactEmail" name="email" placeholder="Enter your email address" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="contactSubject">Subject</label>
            <input type="text" id="contactSubject" name="subject" placeholder="Enter subject" />
          </div>
          
          <div className="form-group">
            <label htmlFor="contactMessage">Message <span className="required">*</span></label>
            <textarea id="contactMessage" name="message" rows="6" placeholder="Write your message here..." required />
          </div>
          
          <button type="submit" className="btn-primary">Send Message</button>
        </form>
        
        {/* Contact Info Inside Card */}
        <div className="contact-info">
          <p>📧 <a href="mailto:support@misinformationguard.com">support@misinformationguard.com</a></p>
          <p>🌐 <a href="https://misinformationguard.com" target="_blank" rel="noreferrer">misinformationguard.com</a></p>
          <p>📱 +1 (555) 123-4567</p>
        </div>
      </div>
    </div>
  </div>
)}

      </div>

      {/* Backend Configuration Modal */}
      {showBackendConfig && (
        <div className="backend-config">
          <div className="config-modal">
            <h3>Backend Configuration</h3>
            <div className="form-group">
              <label htmlFor="backendUrlInput">Backend URL:</label>
              <input 
                type="text" 
                id="backendUrlInput" 
                placeholder="http://localhost:8000"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
              />
            </div>
            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button className="btn-secondary" onClick={() => setShowBackendConfig(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveBackendConfig}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="status-indicator">
        <div className={`status-dot ${isConnected ? 'connected' : ''}`}></div>
        <span>{isConnected ? `Connected to ${backendUrl}` : 'Backend Offline'}</span>
      </div>
    </div>
  );
};

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Check, AlertCircle, Loader, Sun, Moon, Monitor, RefreshCw, Info, ShieldCheck, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function MaskDetectionApp() {
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const applyTheme = () => {
      let effectiveTheme = theme;
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      setIsDark(effectiveTheme === 'dark');
      // Apply class to documentElement so variables are available globally
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    };
    applyTheme();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => theme === 'system' && applyTheme();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please provide a valid image (JPG, PNG).');
      return;
    }
    setImageMeta({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
    setImage(file);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const detectMask = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', image);
      const response = await fetch(`${API_BASE_URL}/detect`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Server connection failed.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Detection failed.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setImageMeta(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', transition: 'all 0.3s ease' }}>
      <style>{`
        :root {
          --bg: #f8fafc;
          --card: #ffffff;
          --text: #0f172a;
          --text-muted: #64748b;
          --accent: #6366f1;
          --border: #e2e8f0;
          --toggle-bg: #f1f5f9;
        }
        .dark {
          --bg: #020617;
          --card: #0f172a;
          --text: #f8fafc;
          --text-muted: #94a3b8;
          --border: #1e293b;
          --toggle-bg: #1e293b;
        }
        
        /* Force color inheritance on common elements */
        * {
          box-sizing: border-box;
          color: inherit; 
        }

        body { 
          background-color: var(--bg);
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .theme-switcher {
          display: flex;
          background: var(--toggle-bg);
          padding: 4px;
          border-radius: 100px;
          border: 1px solid var(--border);
          gap: 4px;
        }

        .theme-btn {
          background: transparent;
          border: none;
          padding: 6px 14px;
          border-radius: 100px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .theme-btn.active {
          background: var(--card);
          color: var(--accent);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .glass-panel { 
          background: var(--card); 
          border: 1px solid var(--border); 
          border-radius: 24px; 
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); 
        }

        .btn-main { 
          background: var(--accent); 
          color: #ffffff !important; /* Always white text on primary buttons */
          border: none; 
          padding: 14px 28px; 
          border-radius: 14px; 
          font-weight: 600; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          transition: all 0.2s; 
        }

        .btn-main:hover:not(:disabled) { 
          transform: translateY(-2px); 
          filter: brightness(1.1);
        }

        .confidence-bar { height: 8px; border-radius: 4px; background: var(--toggle-bg); overflow: hidden; margin-top: 10px; }
        .confidence-fill { height: 100%; transition: width 1s ease-out; background: var(--accent); }
        
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .analyzing { animation: pulse 1.5s infinite; }
      `}</style>

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 2rem', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '12px', color: 'white' }}>
            <ShieldCheck size={24} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>MASK.AI</span>
        </div>

        <div className="theme-switcher">
          <button onClick={() => setTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`}>
            <Sun size={14} /> Light
          </button>
          <button onClick={() => setTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}>
            <Moon size={14} /> Dark
          </button>
          <button onClick={() => setTheme('system')} className={`theme-btn ${theme === 'system' ? 'active' : ''}`}>
            <Monitor size={14} /> System
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-1.5px' }}>Face Mask Detection</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Instant AI validation for safety protocols.</p>
        </header>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          {!imagePreview ? (
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: '20px', 
                padding: '5rem 2rem', 
                textAlign: 'center', 
                cursor: 'pointer', 
                backgroundColor: 'rgba(0,0,0,0.01)'
              }}
            >
              <Upload size={48} color="var(--accent)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Photo</h3>
              <p style={{ color: 'var(--text-muted)' }}>Drag and drop or click to browse</p>
              <input ref={fileInputRef} type="file" hidden onChange={(e) => processFile(e.target.files[0])} />
            </div>
          ) : (
            <div>
              <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                <img src={imagePreview} style={{ width: '100%', display: 'block', maxHeight: '450px', objectFit: 'cover' }} alt="Preview" />
                {loading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
                    <Loader className="analyzing" size={40} color="white" />
                    <p style={{ marginTop: '15px', fontWeight: 600, color: 'white' }}>AI is thinking...</p>
                  </div>
                )}
              </div>

              {!result ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{imageMeta?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={reset} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button onClick={detectMask} disabled={loading} className="btn-main">
                      {loading ? 'Processing...' : 'Run Detection'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>Analysis</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                        {result.mask_detected ? 
                          <Check size={32} color="#10b981" /> : 
                          <AlertCircle size={32} color="#f43f5e" />
                        }
                        <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{result.mask_detected ? 'Masked' : 'No Mask'}</h2>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>Confidence</span>
                      <h2 style={{ fontSize: '1.75rem', margin: '10px 0 0 0', fontWeight: 700 }}>{result.confidence_percentage}%</h2>
                      <div className="confidence-bar">
                        <div className="confidence-fill" style={{ width: `${result.confidence_percentage}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <button onClick={reset} className="btn-main" style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center', background: 'var(--toggle-bg)', color: 'var(--text) !important' }}>
                    <RefreshCw size={18} /> New Analysis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '12px', background: '#fff1f2', border: '1px solid #fda4af', color: '#be123c', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <AlertCircle size={20} color="#be123c" />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
        )}
      </main>
    </div>
  );
}
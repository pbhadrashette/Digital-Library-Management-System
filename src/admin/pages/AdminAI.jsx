import { useEffect, useRef, useState } from 'react';
import { BookOpen, Bot, RefreshCw, Send, Sparkles, Tag, X } from 'lucide-react';
import {
  adminAIChat, adminAIGenerateDescription, adminAIInsights, adminAIRecommendCategory,
} from '../../services/api-backend';
import { showAdminToast } from '../AdminApp';

const CATEGORIES = [
  'Programming','Python','AI','ML','Frontend','Databases','CS Fundamentals',
  'Cloud','Security','DevOps','Mobile','Networking','Engineering','Data Science','Emerging Tech',
];

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI library assistant. I have access to your library stats and can answer questions about book management, user policies, overdue handling, and more. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const res = await adminAIChat(text, history);
    setLoading(false);

    if (res.success) {
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } else {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠ ${res.message || 'AI unavailable. Add GEMINI_API_KEY to .env file.'}` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const SUGGESTIONS = [
    'How many books are currently overdue?',
    'Which category has the most books?',
    'Give me tips to improve library engagement',
    'What are best practices for managing overdue books?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="admin-chat-container">
        <div className="admin-chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`admin-chat-bubble ${m.role}`}>
              <div className="admin-chat-avatar">
                {m.role === 'user' ? 'A' : <Sparkles size={14} />}
              </div>
              <div className="admin-chat-text" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="admin-chat-bubble assistant">
              <div className="admin-chat-avatar"><Sparkles size={14} /></div>
              <div className="admin-chat-text">
                <div className="admin-chat-typing">
                  <div className="admin-chat-dot" />
                  <div className="admin-chat-dot" />
                  <div className="admin-chat-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="admin-chat-input-area">
          <textarea
            className="admin-chat-input"
            placeholder="Ask anything about your library..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="admin-chat-send" onClick={send} disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>
      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setInput(s); }}
            style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12,
              background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)',
              color: 'var(--admin-text-muted)', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--admin-primary)'; e.target.style.color = 'var(--admin-primary-light)'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--admin-border)'; e.target.style.color = 'var(--admin-text-muted)'; }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AI Description Generator ─────────────────────────────────────────────────
function AIDescriptionGenerator() {
  const [form, setForm] = useState({ title: '', author: '', category: '', pages: '', year: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.title) return showAdminToast('Enter a book title', 'error');
    setLoading(true);
    setResult('');
    const res = await adminAIGenerateDescription(form);
    setLoading(false);
    if (res.success) {
      setResult(res.description);
    } else {
      showAdminToast(res.message || 'AI unavailable — add GEMINI_API_KEY to .env', 'error');
    }
  };

  return (
    <div className="admin-ai-feature-card">
      <div className="admin-ai-feature-header">
        <div className="admin-ai-feature-icon"><BookOpen size={20} /></div>
        <div>
          <div className="admin-ai-feature-title">Book Description Generator</div>
          <div className="admin-ai-feature-desc">Generate compelling book descriptions using AI</div>
        </div>
      </div>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label">Book Title *</label>
          <input className="admin-form-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Clean Code" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Author</label>
          <input className="admin-form-input" value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="e.g. Robert C. Martin" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Category</label>
          <select className="admin-form-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Pages / Year</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="admin-form-input" value={form.pages} onChange={(e) => set('pages', e.target.value)} placeholder="Pages" type="number" />
            <input className="admin-form-input" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="Year" type="number" />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="admin-btn admin-btn-primary" onClick={generate} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-purple))', border: 'none' }}>
          <Sparkles size={14} />{loading ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>
      {result && (
        <div className="admin-ai-result">
          <div style={{ fontSize: 10, color: 'var(--admin-primary-light)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={10} /> AI Generated Description
          </div>
          {result}
          <button
            onClick={() => { navigator.clipboard?.writeText(result); showAdminToast('Copied!', 'success'); }}
            style={{ marginTop: 10, background: 'none', border: '1px solid var(--admin-border)', borderRadius: 6, padding: '4px 10px', color: 'var(--admin-text-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

// ─── AI Category Recommender ──────────────────────────────────────────────────
function AICategoryRecommender() {
  const [form, setForm] = useState({ title: '', author: '', description: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const recommend = async () => {
    if (!form.title) return showAdminToast('Enter a book title', 'error');
    setLoading(true);
    setResult('');
    const res = await adminAIRecommendCategory(form);
    setLoading(false);
    if (res.success) {
      setResult(res.category);
    } else {
      showAdminToast(res.message || 'AI unavailable — add GEMINI_API_KEY to .env', 'error');
    }
  };

  return (
    <div className="admin-ai-feature-card">
      <div className="admin-ai-feature-header">
        <div className="admin-ai-feature-icon"><Tag size={20} /></div>
        <div>
          <div className="admin-ai-feature-title">Category Recommender</div>
          <div className="admin-ai-feature-desc">Let AI suggest the best category for any book</div>
        </div>
      </div>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label">Book Title *</label>
          <input className="admin-form-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Introduction to Algorithms" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Author</label>
          <input className="admin-form-input" value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="Author name" />
        </div>
        <div className="admin-form-group full">
          <label className="admin-form-label">Description (optional)</label>
          <textarea className="admin-form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the book..." rows={2} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="admin-btn admin-btn-primary" onClick={recommend} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-purple))', border: 'none' }}>
          <Sparkles size={14} />{loading ? 'Analyzing...' : 'Recommend Category'}
        </button>
      </div>
      {result && (
        <div className="admin-ai-result" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={14} color="var(--admin-primary-light)" />
          <span>Recommended: <strong style={{ color: 'var(--admin-primary-light)' }}>{result}</strong></span>
        </div>
      )}
    </div>
  );
}

// ─── AI Insights ──────────────────────────────────────────────────────────────
function AIInsightsPanel() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminAIInsights();
    if (res.success) setInsights(res);
    else showAdminToast(res.message || 'AI unavailable', 'error');
    setLoading(false);
  };

  return (
    <div className="admin-ai-feature-card" style={{ gridColumn: '1 / -1' }}>
      <div className="admin-ai-feature-header">
        <div className="admin-ai-feature-icon"><Bot size={20} /></div>
        <div>
          <div className="admin-ai-feature-title">Library Health Report</div>
          <div className="admin-ai-feature-desc">AI-generated insights based on your live library data</div>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginLeft: 'auto' }} onClick={load} disabled={loading}>
          <RefreshCw size={12} />{loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      {loading && (
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          {[80, 60, 70].map((w, i) => (
            <div key={i} className="admin-skeleton" style={{ height: 16, width: `${w}%`, borderRadius: 4 }} />
          ))}
        </div>
      )}
      {insights && !loading && (
        <div className="admin-ai-result" style={{ lineHeight: 1.8 }}>
          <div style={{ fontSize: 10, color: 'var(--admin-primary-light)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={10} />
            {insights.aiGenerated ? 'Generated by Gemini AI based on live library data' : 'System-generated summary'}
          </div>
          {insights.insights}
        </div>
      )}
      {!insights && !loading && (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: '8px 0' }}>
          Click "Generate Report" to get AI-powered insights about your library's health.
        </div>
      )}
    </div>
  );
}

// ─── Main AI Page ─────────────────────────────────────────────────────────────
export default function AdminAI() {
  const [tab, setTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: 'AI Assistant', icon: Bot },
    { id: 'tools', label: 'AI Tools', icon: Sparkles },
    { id: 'insights', label: 'Insights Report', icon: RefreshCw },
  ];

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Features
            </span>
            <span style={{ fontSize: 11, background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-purple))', color: 'white', padding: '2px 8px', borderRadius: 20, WebkitTextFillColor: 'white' }}>
              Powered by Gemini
            </span>
          </div>
          <div className="admin-section-subtitle">AI-powered tools to help manage your library</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: tab === id ? 'var(--admin-primary)' : 'none',
              color: tab === id ? 'white' : 'var(--admin-text-muted)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {tab === 'chat' && <AIChat />}
      {tab === 'tools' && (
        <div className="admin-ai-features-grid">
          <AIDescriptionGenerator />
          <AICategoryRecommender />
        </div>
      )}
      {tab === 'insights' && (
        <div className="admin-ai-features-grid" style={{ gridTemplateColumns: '1fr' }}>
          <AIInsightsPanel />
        </div>
      )}
    </div>
  );
}

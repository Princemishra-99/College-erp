import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Sparkles, Send, X, Bot, User, Globe2, HelpCircle } from 'lucide-react';

export const CampusSahayakModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Namaste! Main **Campus Sahayak (कैंपस सहायक)** hoon, powered by Sarvam AI. Aap mujhse College Attendance, Fees, Exams, Timetable ya Notices ke baare me Hindi, Hinglish ya English me pooch sakte hain! Kaise sahayata karoon?',
      provider: 'Sarvam Indic AI',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Hinglish');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Attendance Rules', text: 'College me minimum attendance kitna hona chahiye aur defaulter rule kya hai?' },
    { label: 'Fee Payment & Dues', text: 'Semester fees kab tak bharna hai aur late fee ka kya niyam hai?' },
    { label: 'Exam & Passing Marks', text: 'Mid-Sem aur End-Sem exam me passing marks aur grading system kya hai?' },
    { label: 'Library Timings', text: 'College library kis samay tak khuli rehti hai?' },
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        languagePreference: selectedLanguage,
        history: messages.slice(-4),
      });

      if (res.data.success) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: res.data.reply,
            provider: res.data.provider,
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Maaf kijiye, abhi server se connect hone me samasya aa rahi hai. Kripya punah prayas karein.',
          provider: 'Error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '680px',
          height: '620px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            color: '#fff',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
              }}
            >
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Campus Sahayak</h3>
                <span className="badge badge-ai" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  Sarvam Indic AI
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#c7d2fe', margin: 0 }}>
                Multilingual AI Assistant for College Students & Faculty
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Language Switcher Bar */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '8px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
            <Globe2 size={15} />
            <span style={{ fontWeight: 600 }}>Preferred Language:</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Hinglish', 'हिंदी', 'English'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: selectedLanguage === lang ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: selectedLanguage === lang ? 'var(--primary-light)' : '#fff',
                  color: selectedLanguage === lang ? 'var(--primary)' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Area */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#fdfdfd',
          }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '10px',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={18} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    backgroundColor: isUser ? '#4f46e5' : '#f1f5f9',
                    color: isUser ? '#ffffff' : '#1e293b',
                    borderBottomRightRadius: isUser ? '3px' : '14px',
                    borderBottomLeftRadius: isUser ? '14px' : '3px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  {!isUser && msg.provider && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.68rem',
                        color: '#6366f1',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={11} />
                      <span>{msg.provider}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  fontSize: '0.82rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span className="ai-pulse"></span>
                <span>Campus Sahayak soch raha hai...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              style={{
                fontSize: '0.75rem',
                padding: '5px 12px',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eef2ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            >
              <HelpCircle size={13} color="#6366f1" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <input
            type="text"
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hindi, Hinglish ya English me sawaal poochein..."
            style={{ borderRadius: '999px', paddingLeft: '18px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn btn-ai"
            style={{ borderRadius: '999px', padding: '0 20px', opacity: loading || !input.trim() ? 0.6 : 1 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

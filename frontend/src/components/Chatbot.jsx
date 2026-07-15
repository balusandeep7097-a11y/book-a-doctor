import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm DocAssist AI. How can I help you navigate the platform today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const quickReplies = [
    { q: "How do I book an appointment?", a: "To book an appointment, go to the 'Find Doctors' page in the top menu or dashboard. Choose an approved specialist, select your preferred date, pick a time slot, and click 'Confirm Booking'." },
    { q: "Where do I see my reports?", a: "Your medical reports are stored in your Patient Dashboard. Click 'Dashboard' on the top navbar, choose 'Medical Reports' from the sidebar, and you will see all your uploaded documents." },
    { q: "How do I upload a report?", a: "Go to your Patient Dashboard -> 'Medical Reports' tab. Choose a PDF, JPEG, or PNG file, select the doctor you want to share it with, and click 'Upload Report'." },
    { q: "How does a doctor approve prescriptions?", a: "If you are registered as a Doctor, click 'Consult' on an active appointment. Fill out the digital prescription form (symptoms, medicines, notes) and click 'Submit' to finalize the session." }
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking and reply
    setTimeout(() => {
      let botResponse = "I'm sorry, I didn't quite catch that. Try describing your symptoms (e.g., 'fever', 'headache', 'chest pain') for assistant guidance, or use our quick links below.";
      
      const lowerText = text.toLowerCase();

      // Symptom Analyser Helper
      const checkSymptoms = (input) => {
        const lower = input.toLowerCase();
        
        if (lower.includes('chest') || lower.includes('heart') || lower.includes('cardiac') || lower.includes('palpitation')) {
          return {
            specialty: 'Cardiologist / Cardiac Sciences',
            advice: 'Heart or chest symptoms require careful attention. If you are experiencing chest pain, tightness, or shortness of breath, please consult a Cardiologist immediately. If it is severe, call our emergency line 1800-123-4567 or go to the nearest ER.'
          };
        }
        if (lower.includes('headache') || lower.includes('dizzy') || lower.includes('migraine') || lower.includes('seizure') || lower.includes('numb') || lower.includes('brain')) {
          return {
            specialty: 'Neurologist',
            advice: 'Neurological symptoms like frequent migraines, dizziness, numbness, or memory issues should be evaluated by a Neurologist.'
          };
        }
        if (lower.includes('skin') || lower.includes('acne') || lower.includes('rash') || lower.includes('allergy') || lower.includes('eczema') || lower.includes('pimple')) {
          return {
            specialty: 'Dermatologist',
            advice: 'For skin infections, persistent acne, rashes, eczema, or allergy concerns, booking an appointment with a Dermatologist is highly recommended.'
          };
        }
        if (lower.includes('baby') || lower.includes('child') || lower.includes('kid') || lower.includes('infant') || lower.includes('pediatric')) {
          return {
            specialty: 'Pediatrician',
            advice: 'Children and newborn infants require specialized care. We recommend consulting one of our certified Pediatricians for immunization, development checks, or childhood illnesses.'
          };
        }
        if (lower.includes('tooth') || lower.includes('teeth') || lower.includes('gum') || lower.includes('dentist') || lower.includes('oral') || lower.includes('cavity')) {
          return {
            specialty: 'Dentist / Dentistry',
            advice: 'For toothaches, root canals, braces, gum bleeding, or cosmetic teeth alignment, please consult a Dentist.'
          };
        }
        if (lower.includes('bone') || lower.includes('joint') || lower.includes('fracture') || lower.includes('sprain') || lower.includes('knee') || lower.includes('back pain')) {
          return {
            specialty: 'Orthopedic',
            advice: 'Musculoskeletal concerns like joint pain, backache, sprains, or post-fracture recovery are handled by Orthopedic specialists.'
          };
        }
        if (lower.includes('diet') || lower.includes('weight') || lower.includes('nutrition') || lower.includes('fat') || lower.includes('obese') || lower.includes('slimming') || lower.includes('bariatric')) {
          return {
            specialty: 'Dietician & Nutritionist / Bariatrics',
            advice: 'For weight management, customized diet plans, obesity queries, or metabolic health, you should consult a Dietician or Bariatrics expert.'
          };
        }
        if (lower.includes('anxiety') || lower.includes('stress') || lower.includes('depress') || lower.includes('mental') || lower.includes('insomnia') || lower.includes('sleep')) {
          return {
            specialty: 'Psychiatrist',
            advice: 'Mental and emotional well-being is vital. For chronic anxiety, depression, persistent stress, or sleep disorders, our certified Psychiatrists offer professional counseling and therapy.'
          };
        }
        if (lower.includes('fever') || lower.includes('cold') || lower.includes('cough') || lower.includes('flu') || lower.includes('stomach') || lower.includes('vomit') || lower.includes('head') || lower.includes('body ache')) {
          return {
            specialty: 'General Practitioner',
            advice: 'For common symptoms like fever, flu, stomach upset, persistent cough, or general health concerns, a General Practitioner is your first line of consultation.'
          };
        }
        return null;
      };

      const symptomResult = checkSymptoms(text);

      if (symptomResult) {
        botResponse = `I understand you are experiencing symptoms. Based on your description, here is some assistant guidance:

🧑‍⚕️ Recommended Specialty: ${symptomResult.specialty}

💡 Guidance: ${symptomResult.advice}

⚠️ Disclaimer: DocAssist AI symptom routing is for guidance only and does not replace medical diagnostics. For emergencies, visit the nearest hospital or dial 1800-123-4567 immediately.`;
      } else if (lowerText.includes('book') || lowerText.includes('appointment') || lowerText.includes('doctor')) {
        botResponse = "To book a session: Navigate to the 'Find Doctors' page on the top navigation bar, select a specialist, choose a date/time slot, and complete the booking.";
      } else if (lowerText.includes('report') || lowerText.includes('document') || lowerText.includes('upload') || lowerText.includes('pdf')) {
        botResponse = "To manage reports: Visit your Patient Dashboard, open the 'Medical Reports' tab. You can upload JPEG/PNG/PDF files and assign them to doctors.";
      } else if (lowerText.includes('prescription') || lowerText.includes('consult')) {
        botResponse = "Prescriptions are added by Doctors during the consultation. Once submitted, they appear instantly on the Patient Dashboard under 'Appointment History' -> 'View Prescription'.";
      } else if (lowerText.includes('login') || lowerText.includes('register') || lowerText.includes('admin')) {
        botResponse = "You can register as a Patient or Doctor. Admins must log in with admin credentials to verify and approve Doctor registration files.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <>
      {/* MINIMIZED FLOATING BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          }}
          title="Need Help Navigating?"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* EXPANDED CHAT PANEL */}
      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '360px',
            height: '500px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%' }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: '600', fontSize: '15px' }}>DocAssist AI</h4>
                <span style={{ fontSize: '11px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  Online Guide
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages scroll area */}
          <div
            style={{
              flexGrow: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                    alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  }}
                >
                  {msg.sender === 'bot' ? <Bot size={12} /> : <User size={12} />}
                  <span>{msg.sender === 'bot' ? 'DocAssist' : user?.name || 'You'}</span>
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'bot' ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                    backgroundColor: msg.sender === 'bot' ? 'var(--bg-card)' : 'var(--primary-color)',
                    color: msg.sender === 'bot' ? 'var(--text-main)' : 'white',
                    border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                    fontSize: '13.5px',
                    lineHeight: '1.4',
                  }}
                >
                  {msg.text}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  }}
                >
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={12} style={{ color: 'var(--text-muted)' }} />
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '0px 12px 12px 12px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'pulse 1s infinite alternate' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'pulse 1s infinite alternate 0.2s' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'pulse 1s infinite alternate 0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick options panel */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={12} /> Click for Quick Guidance:
            </span>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
              }}
            >
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMessages(prev => [...prev, {
                      id: Date.now(),
                      sender: 'user',
                      text: qr.q,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: qr.a,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }]);
                      setIsTyping(false);
                    }, 800);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--primary-color)',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  {qr.q}
                </button>
              ))}
            </div>
          </div>

          {/* Form input area */}
          <form
            onSubmit={handleFormSubmit}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <input
              type="text"
              placeholder="Ask DocAssist..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--primary-color)',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;

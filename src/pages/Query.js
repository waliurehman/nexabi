import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Send, Paperclip, User, Database, FileSpreadsheet, Link2, CheckCircle, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

const pageV = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }, exit: { opacity: 0, y: -10 } };
const COLORS = ['#6C63FF', '#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const initialMessages = [
  { id: 1, type: 'ai', content: "Hello! I'm NexaBI. I can analyze your connected datasets, generate charts, and answer questions about your data. What would you like to explore?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
];

const dataSources = [
  { name: 'sales_2024.csv', type: 'CSV', icon: FileSpreadsheet, size: '2.4 MB' },
  { name: 'customers_db', type: 'PostgreSQL', icon: Database, size: '142 tables' },
  { name: 'marketing_data.csv', type: 'CSV', icon: FileSpreadsheet, size: '856 KB' },
  { name: 'Power BI Workspace', type: 'Power BI', icon: Link2, size: '8 reports' },
];

const SYSTEM_PROMPT = `You are NexaBI AI assistant. Help users analyze data, suggest charts, and answer data-related questions.
If a user asks to see data visualized, or asks for a chart, respond with JSON embedded in your answer using this EXACT format:
{CHART_DATA: {"type": "bar", "title": "Chart Title", "data": [{"name": "A", "val": 10}, {"name": "B", "val": 20}], "xKey": "name", "yKey": "val"}}
Valid types: bar, line, pie, area.
Make sure the JSON is valid and on its own block. Feel free to add conversational explanation before or after the JSON block.`;

const Query = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const apiKey = process.env.REACT_APP_GROQ_KEY || '';
  const endRef = useRef(null);
  
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    const newMessages = [...messages, { id: Date.now(), type: 'user', content: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages(p => [...p, { id: Date.now(), type: 'ai', content: "Please enter your Groq API key at the top to enable AI responses.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.slice(1).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.rawContent || m.content }))
          ],
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response generated.';
      
      let parsedContent = aiResponse;
      let chartData = null;

      // Extract JSON chart payload if present
      const chartMatch = aiResponse.match(/\{CHART_DATA:\s*(\{.*?\})\}/s);
      if (chartMatch) {
        try {
          chartData = JSON.parse(chartMatch[1]);
          parsedContent = aiResponse.replace(chartMatch[0], '').trim();
        } catch (e) {
          console.error("Failed to parse chart JSON", e);
        }
      }

      setMessages(p => [...p, { 
        id: Date.now(), 
        type: 'ai', 
        content: parsedContent,
        rawContent: aiResponse, 
        chart: chartData,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);

    } catch (error) {
      console.error(error);
      setMessages(p => [...p, { id: Date.now(), type: 'ai', content: `Error: Could not fetch response. ${error.message} Check your API key or network.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderChart = (chart) => {
    if (!chart || !chart.data || !chart.data.length) return null;
    return (
      <div style={S.inlineChart}>
        {chart.title && <h4 style={{fontSize:'13px', fontWeight:600, color:'var(--text-primary)', marginBottom:'12px', textAlign:'center'}}>{chart.title}</h4>}
        <ResponsiveContainer width="100%" height={200}>
          {chart.type === 'bar' ? (
            <BarChart data={chart.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false}/>
              <XAxis dataKey={chart.xKey} axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)',boxShadow:'var(--shadow-md)'}}/>
              <Bar dataKey={chart.yKey} fill="#6C63FF" radius={[4,4,0,0]}/>
            </BarChart>
          ) : chart.type === 'line' ? (
            <LineChart data={chart.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false}/>
              <XAxis dataKey={chart.xKey} axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>
              <Line type="monotone" dataKey={chart.yKey} stroke="#3B82F6" strokeWidth={3} dot={{r:4,fill:'#3B82F6',strokeWidth:2}}/>
            </LineChart>
          ) : chart.type === 'area' ? (
            <AreaChart data={chart.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false}/>
              <XAxis dataKey={chart.xKey} axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'var(--chart-text)'}}/>
              <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>
              <Area type="monotone" dataKey={chart.yKey} stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} strokeWidth={2}/>
            </AreaChart>
          ) : chart.type === 'pie' ? (
            <PieChart>
              <RechartsTooltip contentStyle={{background:'var(--tooltip-bg)',borderRadius:'10px',border:'1px solid var(--tooltip-border)'}}/>
              <Pie data={chart.data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey={chart.yKey} nameKey={chart.xKey}>
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : <div style={{padding:'20px', textAlign:'center', color:'var(--text-tertiary)'}}>Unsupported chart type</div>}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <div style={S.container}>
        <div style={S.chatArea}>
          


          <div style={S.messagesArea}>
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                  {msg.type === 'ai' && <div style={S.aiAvatar}><Sparkles size={16} color="#fff" /></div>}
                  <div style={{ ...S.bubble, ...(msg.type === 'user' ? S.userBubble : S.aiBubble) }}>
                    {msg.content && <p style={{ fontSize: '14px', lineHeight: 1.6, color: msg.type === 'user' ? '#fff' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
                    
                    {msg.chart && renderChart(msg.chart)}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: msg.type === 'ai' ? 'space-between' : 'flex-end', marginTop: '8px' }}>
                      {msg.type === 'ai' && <div style={{ display: 'flex', gap: '4px' }}>
                        {[Copy, ThumbsUp, ThumbsDown].map((I, i) => <button key={i} onClick={() => i===0 && navigator.clipboard.writeText(msg.rawContent)} style={S.actBtn}><I size={13} /></button>)}
                      </div>}
                      <span style={{ fontSize: '11px', color: msg.type === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)' }}>{msg.time}</span>
                    </div>
                  </div>
                  {msg.type === 'user' && <div style={S.userAvatar}><User size={16} color="#fff" /></div>}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={S.aiAvatar}><Sparkles size={16} color="#fff" /></div>
                <div style={S.aiBubble}><div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'typing 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />)}
                </div></div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>
          <div style={S.inputArea}>
            <div style={S.inputWrap}>
              <motion.button style={S.attachBtn} whileHover={{ backgroundColor: 'var(--hover-bg)' }}><Paperclip size={18} color="var(--text-tertiary)" /></motion.button>
              <input type="text" placeholder="Ask anything about your data... (e.g. 'Show me a bar chart of Q1 sales')" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} style={S.input} />
              <motion.button style={{ ...S.sendBtn, opacity: input.trim() ? 1 : 0.5 }} onClick={handleSend} whileHover={input.trim() ? { scale: 1.05 } : {}} whileTap={input.trim() ? { scale: 0.95 } : {}}>
                <Send size={18} color="#fff" />
              </motion.button>
            </div>
          </div>
        </div>
        <div style={S.panel}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Data Sources</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px', marginBottom: '20px' }}>Connected datasets for AI queries</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
            {dataSources.map((s, i) => {
              const I = s.icon; return (
                <motion.div key={i} style={S.sourceItem} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ backgroundColor: 'var(--hover-bg)' }}>
                  <div style={S.sourceIcon}><I size={18} color="var(--primary)" /></div>
                  <div style={{ flex: 1 }}><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</p><p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{s.size}</p></div>
                  <CheckCircle size={14} color="var(--success)" />
                </motion.div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Queries</h4>
            {['Show me a pie chart of revenue by category', 'Generate a line chart for 6 months sales', 'Compare Q1 vs Q2 performance in a bar chart'].map((q, i) => (
              <motion.button key={i} style={S.sugBtn} whileHover={{ borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => setInput(q)}>
                <Sparkles size={14} />{q}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes typing{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </motion.div>
  );
};

const S = {
  page: { height: 'calc(100vh - var(--topbar-height))', padding: 0 },
  container: { display: 'flex', height: '100%' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' },

  messagesArea: { flex: 1, padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  aiAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(108,99,255,0.25)' },
  userAvatar: { width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble: { maxWidth: '70%', borderRadius: '16px', padding: '14px 18px' },
  userBubble: { background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', borderBottomRightRadius: '4px', boxShadow: '0 2px 12px rgba(108,99,255,0.2)' },
  aiBubble: { background: 'var(--card)', border: '1px solid var(--border)', borderBottomLeftRadius: '4px', boxShadow: 'var(--shadow-card)' },
  inlineChart: { marginTop: '14px', padding: '20px 10px 10px', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border)' },
  actBtn: { width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' },
  inputArea: { padding: '16px 24px 20px', borderTop: '1px solid var(--border)', background: 'var(--card)' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--input-bg)', borderRadius: '14px', padding: '6px 8px 6px 6px', border: '1px solid var(--border)' },
  attachBtn: { width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, background: 'transparent', fontSize: '14px', color: 'var(--text-primary)', padding: '8px 0', border: 'none', outline: 'none' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6C63FF,#3B82F6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108,99,255,0.25)' },
  panel: { width: '300px', padding: '24px', background: 'var(--card)', overflowY: 'auto', flexShrink: 0 },
  sourceItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer' },
  sourceIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(108,99,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sugBtn: { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', marginBottom: '6px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', textAlign: 'left' },
};

export default Query;

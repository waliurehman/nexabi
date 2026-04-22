import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, File, Image, Mail, Presentation, Search, MessageSquare, Trash2, Eye, Upload, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';

const pageV = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0,transition:{duration:0.4}}, exit:{opacity:0,y:-10} };

const docTypes = [
  {name:'PDF',icon:FileText,color:'#EF4444'},{name:'Word',icon:File,color:'#3B82F6'},{name:'PowerPoint',icon:Presentation,color:'#F59E0B'},
  {name:'Image',icon:Image,color:'#10B981'},{name:'Email',icon:Mail,color:'#6C63FF'},
];
const statusMap = { Ready:{icon:CheckCircle,color:'var(--success)',bg:'rgba(16,185,129,0.1)'}, Processing:{icon:Loader,color:'var(--warning)',bg:'rgba(245,158,11,0.1)'}, Error:{icon:AlertCircle,color:'var(--danger)',bg:'rgba(239,68,68,0.1)'}, Queued:{icon:Clock,color:'var(--text-tertiary)',bg:'rgba(156,163,175,0.1)'} };
const initDocs = [
  {name:'Annual Report 2024.pdf',type:'PDF',size:'4.2 MB',date:'Apr 18, 2026',status:'Ready'},
  {name:'Marketing Strategy.docx',type:'Word',size:'1.8 MB',date:'Apr 17, 2026',status:'Ready'},
  {name:'Q1 Financials.xlsx',type:'Excel',size:'3.1 MB',date:'Apr 16, 2026',status:'Processing'},
  {name:'Team Presentation.pptx',type:'PowerPoint',size:'12.4 MB',date:'Apr 15, 2026',status:'Ready'},
  {name:'Product Screenshots.zip',type:'Image',size:'8.6 MB',date:'Apr 14, 2026',status:'Error'},
  {name:'Client Contracts.pdf',type:'PDF',size:'2.3 MB',date:'Apr 13, 2026',status:'Queued'},
];
const typeColors = {PDF:'#EF4444',Word:'#3B82F6',Excel:'#10B981',PowerPoint:'#F59E0B',Image:'#06B6D4'};

const Documents = () => {
  const [search,setSearch] = useState('');
  const [activeType,setActiveType] = useState('All');
  const types = ['All','PDF','Word','PowerPoint','Image','Email'];
  const filtered = initDocs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === 'All' || d.type === activeType;
    return matchSearch && matchType;
  });

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <style>{`
        .documents-page { padding: 28px 32px; max-width: 1400px; }
        .table-wrap { overflow-x: auto; }
        .table-inner { min-width: 800px; }
        
        @media (max-width: 768px) {
          .documents-page { padding: 20px 16px; }
        }
      `}</style>
      <div className="documents-page">
        <div style={S.header}>
          <div><h1 style={S.title}>Documents</h1><p style={S.subtitle}>Upload and manage unstructured documents for AI querying</p></div>
          <motion.button style={S.uploadBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}}><Upload size={16}/>Upload Document</motion.button>
        </div>

        <motion.div style={S.card} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
          <h4 style={{fontSize:'12px',fontWeight:600,color:'var(--text-tertiary)',letterSpacing:'0.08em',marginBottom:'16px',textTransform:'uppercase'}}>Supported Document Types</h4>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            {docTypes.map(dt=>{const I=dt.icon;return(
              <motion.div key={dt.name} style={S.docType} whileHover={{y:-2,boxShadow:'var(--shadow-md)'}}>
                <I size={20} color={dt.color}/><span style={{fontSize:'13px',fontWeight:600,color:'var(--text-primary)'}}>{dt.name}</span>
              </motion.div>
            );})}
          </div>
        </motion.div>

        <motion.div style={S.card} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <div style={{display:'flex',gap:'16px',alignItems:'center',marginBottom:'20px',flexWrap:'wrap'}}>
            <div style={S.searchWrap}><Search size={16} color="var(--text-tertiary)"/><input type="text" placeholder="Search documents..." value={search} onChange={e=>setSearch(e.target.value)} style={S.searchInput}/></div>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {types.map(t=>(
                <button key={t} onClick={()=>setActiveType(t)} style={{...S.typeBtn,...(activeType===t?S.typeBtnActive:{})}}>{t}</button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <div className="table-inner">
              <div style={S.tableHeader}>
                <span style={{...S.th,flex:2.5}}>FILE NAME</span>
                <span style={S.th}>TYPE</span><span style={S.th}>SIZE</span><span style={S.th}>UPLOAD DATE</span><span style={S.th}>STATUS</span><span style={{...S.th,textAlign:'right'}}>ACTIONS</span>
              </div>
              {filtered.map((doc,i)=>{
                const st=statusMap[doc.status];const StI=st.icon;const tc=typeColors[doc.type]||'var(--primary)';return(
                <motion.div key={doc.name} style={S.tableRow} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} whileHover={{backgroundColor:'var(--hover-bg)'}}>
                  <div style={{...S.td,flex:2.5,display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`${tc}12`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><FileText size={18} color={tc}/></div>
                    <span style={{fontWeight:600,color:'var(--text-primary)'}}>{doc.name}</span>
                  </div>
                  <span style={S.td}>{doc.type}</span><span style={S.td}>{doc.size}</span><span style={S.td}>{doc.date}</span>
                  <span style={{...S.td}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'4px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:600,color:st.color,background:st.bg}}>
                      <StI size={12}/>{doc.status}
                    </span>
                  </span>
                  <div style={{...S.td,display:'flex',justifyContent:'flex-end',gap:'4px'}}>
                    {doc.status==='Ready'&&<motion.button style={S.actionBtn} whileHover={{backgroundColor:'rgba(108,99,255,0.1)'}} whileTap={{scale:0.9}}><MessageSquare size={14} color="var(--primary)"/></motion.button>}
                    <motion.button style={S.actionBtn} whileHover={{backgroundColor:'var(--hover-bg)'}} whileTap={{scale:0.9}}><Eye size={14}/></motion.button>
                    <motion.button style={S.actionBtn} whileHover={{backgroundColor:'rgba(239,68,68,0.1)'}} whileTap={{scale:0.9}}><Trash2 size={14} color="var(--danger)"/></motion.button>
                  </div>
                </motion.div>
              );})}
              {filtered.length===0&&<div style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)',fontSize:'14px'}}>No documents found.</div>}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const S = {
  page:{},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px', flexWrap: 'wrap', gap: '16px'},
  title:{fontSize:'26px',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.02em'},
  subtitle:{fontSize:'14px',color:'var(--text-secondary)',marginTop:'6px'},
  uploadBtn:{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',border:'none',borderRadius:'10px',padding:'10px 24px',fontSize:'14px',fontWeight:600,display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',boxShadow:'0 4px 12px rgba(108,99,255,0.25)'},
  card:{background:'var(--card)',borderRadius:'16px',padding:'24px',boxShadow:'var(--shadow-card)',border:'1px solid var(--border)',marginBottom:'20px'},
  docType:{display:'flex',alignItems:'center',gap:'10px',padding:'14px 22px',borderRadius:'12px',background:'var(--input-bg)',border:'1px solid var(--border)',cursor:'pointer',transition:'all 0.25s ease'},
  searchWrap:{display:'flex',alignItems:'center',gap:'10px',background:'var(--input-bg)',borderRadius:'10px',padding:'10px 14px',border:'1px solid var(--border)',flex:1,minWidth:'200px'},
  searchInput:{flex:1,background:'transparent',fontSize:'14px',color:'var(--text-primary)', outline: 'none', border: 'none'},
  typeBtn:{padding:'8px 16px',borderRadius:'8px',border:'1px solid var(--border)',background:'transparent',fontSize:'12px',fontWeight:500,color:'var(--text-secondary)',cursor:'pointer'},
  typeBtnActive:{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',border:'1px solid transparent',boxShadow:'0 2px 8px rgba(108,99,255,0.3)'},
  tableHeader:{display:'flex',padding:'12px 16px',borderBottom:'1px solid var(--border)'},
  th:{fontSize:'11px',fontWeight:600,color:'var(--text-tertiary)',letterSpacing:'0.06em',flex:1,textTransform:'uppercase'},
  tableRow:{display:'flex',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid var(--border)',transition:'background 0.15s ease',cursor:'pointer'},
  td:{fontSize:'13px',color:'var(--text-secondary)',flex:1},
  actionBtn:{width:'32px',height:'32px',borderRadius:'8px',border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-tertiary)'},
};

export default Documents;

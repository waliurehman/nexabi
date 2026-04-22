import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, FileSpreadsheet, File, FileText, Database, Plus, CheckCircle, Cloud, HardDrive, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadDataset, getDatasets, deleteDataset } from '../api/files';

const pageV = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0,transition:{duration:0.4}}, exit:{opacity:0,y:-10} };
const cardV = { initial:{opacity:0,y:20}, animate:(i)=>({opacity:1,y:0,transition:{delay:i*0.1,duration:0.4}}) };

const formats = [
  {name:'CSV',icon:FileSpreadsheet,color:'#10B981'},{name:'Excel',icon:FileSpreadsheet,color:'#3B82F6'},
  {name:'PDF',icon:FileText,color:'#EF4444'},{name:'Word',icon:File,color:'#6C63FF'},{name:'JSON',icon:File,color:'#F59E0B'},
];

const databases = [
  {name:'PostgreSQL',host:'db.production.nexabi.io',status:'connected',color:'#3B82F6',tables:142,icon:Database},
  {name:'MongoDB',host:'mongo.cluster.nexabi.io',status:'disconnected',color:'#10B981',tables:28,icon:HardDrive},
];

const UploadPage = () => {
  const [isDragging, setDrag] = useState(false);
  const [files, setFiles] = useState([]);
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const data = await getDatasets(token);
      const formatted = data.map(d => ({
        id: d.id,
        name: d.filename,
        size: (d.size / 1024 / 1024).toFixed(2) + ' MB',
        progress: 100,
        status: 'complete'
      }));
      setFiles(formatted);
    } catch (error) {
      console.error("Error fetching datasets:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const handleDragOver = useCallback(e => { e.preventDefault(); setDrag(true); }, []);
  const handleDragLeave = useCallback(() => setDrag(false), []);

  const handleFile = async (file) => {
    if (!file) return;
    const tempId = Date.now();
    
    setFiles(prev => [...prev, {
      id: tempId,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      progress: 0,
      status: 'uploading'
    }]);

    try {
      await uploadDataset(file, token, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setFiles(prev => prev.map(f => f.id === tempId ? { ...f, progress: percentCompleted } : f));
      });
      fetchFiles(); // Refresh list to get actual ID from backend
    } catch (error) {
      console.error("Upload failed", error);
      setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'error' } : f));
    }
  };

  const handleDrop = useCallback(e => {
    e.preventDefault(); 
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [token]);

  const handleSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDelete = async (fileObj) => {
    if (fileObj.status === 'uploading') return;
    try {
      if (fileObj.id && fileObj.status === 'complete') {
        await deleteDataset(fileObj.id, token);
      }
      setFiles(prev => prev.filter(f => f.id !== fileObj.id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <motion.div style={S.page} variants={pageV} initial="initial" animate="animate" exit="exit">
      <div style={S.header}><h1 style={S.title}>Upload Data</h1><p style={S.subtitle}>Connect your data sources to start querying with AI</p></div>

      <motion.div style={{...S.dropZone,...(isDragging?S.dropActive:{})}} variants={cardV} custom={0}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        whileHover={{borderColor:'var(--primary)'}}>
        <motion.div style={S.uploadIconWrap} animate={isDragging?{scale:1.1,y:-4}:{scale:1,y:0}}>
          <Cloud size={32} color={isDragging?'var(--primary)':'var(--text-tertiary)'}/>
        </motion.div>
        <h3 style={{fontSize:'18px',fontWeight:700,color:'var(--text-primary)',marginBottom:'6px'}}>{isDragging?'Drop your files here':'Drop CSV or Excel files here'}</h3>
        <p style={{fontSize:'14px',color:'var(--text-tertiary)',marginBottom:'20px'}}>or click to browse from your computer</p>
        <input type="file" ref={fileInputRef} onChange={handleSelectFile} style={{ display: 'none' }} accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.json" />
        <motion.button onClick={() => fileInputRef.current.click()} style={S.browseBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}}><UploadIcon size={16}/>Browse Files</motion.button>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center',marginTop:'24px'}}>
          {formats.map(f=>{const I=f.icon;return(
            <div key={f.name} style={S.formatBadge}><I size={14} color={f.color}/><span>{f.name}</span></div>
          );})}
        </div>
      </motion.div>

      <motion.div style={S.card} variants={cardV} custom={1} initial="initial" animate="animate">
        <h3 style={S.cardTitle}>Uploaded Files</h3>
        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
          <AnimatePresence>
            {files.map((f,i)=>(
              <motion.div key={f.id} style={S.fileItem} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} transition={{delay:i*0.05}} whileHover={{backgroundColor:'var(--hover-bg)'}}>
                <div style={S.fileIcon}><FileSpreadsheet size={20} color={f.status==='error'?'var(--danger)':'var(--primary)'}/></div>
                <div style={{flex:1}}>
                  <p style={{fontSize:'14px',fontWeight:600,color:f.status==='error'?'var(--danger)':'var(--text-primary)'}}>{f.name}</p>
                  <p style={{fontSize:'12px',color:'var(--text-tertiary)',marginTop:'2px'}}>{f.size}</p>
                  {f.status==='uploading'&&<div style={S.progressBar}><motion.div style={S.progressFill} initial={{width:0}} animate={{width:`${f.progress}%`}}/></div>}
                  {f.status==='error'&&<p style={{fontSize:'12px',color:'var(--danger)',marginTop:'2px'}}>Upload failed</p>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  {f.status==='complete'?<CheckCircle size={18} color="var(--success)"/>:
                   f.status==='uploading'?<span style={{fontSize:'12px',fontWeight:600,color:'var(--primary)'}}>{f.progress}%</span>:null}
                  <motion.button style={S.rmBtn} onClick={()=>handleDelete(f)} whileHover={{backgroundColor:'rgba(239,68,68,0.1)'}}><Trash2 size={15} color="var(--text-tertiary)"/></motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {files.length===0&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 20px'}}>
            <p style={{color:'var(--text-tertiary)',fontSize:'14px'}}>No files uploaded yet. Drag & drop to get started.</p>
          </div>}
        </div>
      </motion.div>

      <motion.div style={S.card} variants={cardV} custom={2} initial="initial" animate="animate">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={S.cardTitle}>Connected Databases</h3>
          <motion.button style={S.addBtn} whileHover={{scale:1.03}} whileTap={{scale:0.97}}><Plus size={16}/>New Connection</motion.button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {databases.map((db,i)=>{const I=db.icon;const c=db.status==='connected';return(
            <motion.div key={db.name} style={S.dbCard} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.1}} whileHover={{y:-2,boxShadow:'var(--shadow-md)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <div style={{width:'46px',height:'46px',borderRadius:'12px',background:`${db.color}15`,display:'flex',alignItems:'center',justifyContent:'center'}}><I size={22} color={db.color}/></div>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:c?'var(--success)':'var(--text-tertiary)'}}/>
              </div>
              <h4 style={{fontSize:'16px',fontWeight:700,color:'var(--text-primary)',marginBottom:'4px'}}>{db.name}</h4>
              <p style={{fontSize:'12px',color:'var(--text-tertiary)',marginBottom:'14px'}}>{db.host}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <span style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'var(--text-secondary)'}}><Database size={13}/>{db.tables} {db.name==='MongoDB'?'collections':'tables'}</span>
                <span style={{padding:'3px 10px',borderRadius:'6px',fontSize:'11px',fontWeight:600,color:c?'var(--success)':'var(--text-tertiary)',background:c?'rgba(16,185,129,0.1)':'rgba(156,163,175,0.1)'}}>{c?'Connected':'Disconnected'}</span>
              </div>
              <motion.button style={{width:'100%',padding:'10px',borderRadius:'10px',border:'none',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',
                background:c?'var(--input-bg)':'linear-gradient(135deg,#6C63FF,#3B82F6)',color:c?'var(--text-secondary)':'#fff'}} whileHover={{scale:1.02}}>
                {c?<><RefreshCw size={14}/>Reconnect</>:<><Plus size={14}/>Connect</>}
              </motion.button>
            </motion.div>
          );})}
          <motion.div style={S.addCard} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}} whileHover={{borderColor:'var(--primary)'}}>
            <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'var(--input-bg)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'12px'}}><Plus size={28} color="var(--text-tertiary)"/></div>
            <p style={{fontSize:'14px',fontWeight:600,color:'var(--text-primary)',marginBottom:'4px'}}>Add New Database</p>
            <p style={{fontSize:'12px',color:'var(--text-tertiary)'}}>MySQL, SQLite, & more</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const S = {
  page:{padding:'28px 32px',maxWidth:'1400px'},
  header:{marginBottom:'28px'},
  title:{fontSize:'26px',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.02em'},
  subtitle:{fontSize:'14px',color:'var(--text-secondary)',marginTop:'6px'},
  dropZone:{background:'var(--card)',borderRadius:'20px',border:'2px dashed var(--border)',padding:'48px 32px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',cursor:'pointer',transition:'all 0.25s ease',marginBottom:'24px'},
  dropActive:{borderColor:'var(--primary)',boxShadow:'0 0 0 4px rgba(108,99,255,0.08)'},
  uploadIconWrap:{width:'72px',height:'72px',borderRadius:'20px',background:'var(--input-bg)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px'},
  browseBtn:{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',border:'none',borderRadius:'10px',padding:'12px 28px',fontSize:'14px',fontWeight:600,display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',boxShadow:'0 4px 16px rgba(108,99,255,0.3)'},
  formatBadge:{display:'flex',alignItems:'center',gap:'6px',padding:'6px 14px',borderRadius:'8px',background:'var(--input-bg)',fontSize:'12px',fontWeight:500,color:'var(--text-secondary)',border:'1px solid var(--border)'},
  card:{background:'var(--card)',borderRadius:'16px',padding:'24px',boxShadow:'var(--shadow-card)',border:'1px solid var(--border)',marginBottom:'24px'},
  cardTitle:{fontSize:'16px',fontWeight:700,color:'var(--text-primary)',marginBottom:'16px'},
  fileItem:{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',borderRadius:'12px',transition:'background 0.15s ease'},
  fileIcon:{width:'42px',height:'42px',borderRadius:'10px',background:'rgba(108,99,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  progressBar:{height:'4px',background:'var(--input-bg)',borderRadius:'2px',marginTop:'8px',overflow:'hidden'},
  progressFill:{height:'100%',background:'linear-gradient(135deg,#6C63FF,#3B82F6)',borderRadius:'2px'},
  rmBtn:{width:'32px',height:'32px',borderRadius:'8px',border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'},
  addBtn:{background:'linear-gradient(135deg,#6C63FF,#3B82F6)',color:'#fff',border:'none',borderRadius:'10px',padding:'10px 18px',fontSize:'13px',fontWeight:600,display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',boxShadow:'0 4px 12px rgba(108,99,255,0.25)'},
  dbCard:{background:'var(--card)',borderRadius:'16px',padding:'22px',border:'1px solid var(--border)',boxShadow:'var(--shadow-card)',transition:'all 0.25s ease',cursor:'pointer'},
  addCard:{borderRadius:'16px',border:'2px dashed var(--border)',padding:'32px 22px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.25s ease',textAlign:'center'},
};

export default UploadPage;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'node:crypto';
import { z } from 'zod';
import { pool } from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const SESSION_DAYS = 7;
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true', path: '/', maxAge: SESSION_DAYS * 86400000 };
const sha = (s) => createHash('sha256').update(`${s}${process.env.SESSION_PEPPER || 'local-development-pepper'}`).digest('hex');
const asyncRoute = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

function auth(req,res,next) {
  Promise.resolve().then(async()=>{
    const raw = req.cookies.ucu_session;
    if (!raw) return res.status(401).json({ error: 'Sign in to continue.' });
    const [rows] = await pool.execute('SELECT u.id,u.name,u.email,u.role FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>UTC_TIMESTAMP()', [sha(raw)]);
    if (!rows.length) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    req.user = rows[0]; next();
  }).catch(next);
}
const admin = (req,res,next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Administrator access is required.' });
const valid = (schema, obj) => { const result = schema.safeParse(obj); if (!result.success) { const e = new Error(result.error.issues.map(x => `${x.path.join('.') || 'Input'}: ${x.message}`).join(' ')); e.status=400; throw e; } return result.data; };
const emailSchema = z.string().trim().email().max(190);
const registerSchema = z.object({ name:z.string().trim().min(2).max(100), email:emailSchema, password:z.string().min(10).max(72) });
const reportSchema = z.object({ kind:z.enum(['lost','found']), title:z.string().trim().min(2).max(120), category:z.string().trim().min(2).max(60), description:z.string().trim().min(10).max(1200), identifyingDetails:z.string().trim().max(1200).optional().nullable(), itemDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/), location:z.string().trim().min(2).max(120), photoUrl:z.string().trim().max(500).optional().nullable().refine(v=>!v || v.startsWith('/uploads/') || /^https:\/\//.test(v), 'Use an HTTPS image URL or uploaded image.') });

app.get('/api/health', asyncRoute(async (_req,res) => { await pool.query('SELECT 1'); res.json({ ok:true }); }));
app.post('/api/auth/register', asyncRoute(async (req,res) => {
  const input = valid(registerSchema,req.body); const hash = await bcrypt.hash(input.password,12);
  try { const [r] = await pool.execute('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,\'student\')',[input.name,input.email.toLowerCase(),hash]); res.status(201).json({ id:r.insertId,name:input.name,email:input.email.toLowerCase() }); }
  catch(e) { if(e.code==='ER_DUP_ENTRY') return res.status(409).json({error:'An account with that email already exists.'}); throw e; }
}));
app.post('/api/auth/login', asyncRoute(async (req,res) => {
  const data=valid(z.object({email:emailSchema,password:z.string().min(1).max(72)}),req.body);
  const [rows]=await pool.execute('SELECT id,name,email,password_hash,role FROM users WHERE email=?',[data.email.toLowerCase()]);
  if(!rows.length || !(await bcrypt.compare(data.password,rows[0].password_hash))) return res.status(401).json({error:'Email or password is incorrect.'});
  const raw=randomBytes(32).toString('base64url'); const expiry=new Date(Date.now()+SESSION_DAYS*86400000);
  await pool.execute('INSERT INTO auth_sessions(id,user_id,expires_at) VALUES(?,?,?)',[sha(raw),rows[0].id,expiry]); res.cookie('ucu_session',raw,cookieOpts);
  res.json({id:rows[0].id,name:rows[0].name,email:rows[0].email,role:rows[0].role});
}));
app.get('/api/auth/me',auth,(req,res)=>res.json(req.user));
app.post('/api/auth/logout',asyncRoute(async(req,res)=>{if(req.cookies.ucu_session) await pool.execute('DELETE FROM auth_sessions WHERE id=?',[sha(req.cookies.ucu_session)]);res.clearCookie('ucu_session',{...cookieOpts,maxAge:undefined});res.status(204).end();}));

app.get('/api/reports',asyncRoute(async(req,res)=>{
  const filters=valid(z.object({q:z.string().trim().max(100).optional(),kind:z.enum(['lost','found']).optional(),category:z.string().max(60).optional(),location:z.string().max(120).optional(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),status:z.enum(['open','returned']).optional()}).partial(),req.query);
  let sql='SELECT r.id,r.kind,r.title,r.category,r.description,r.item_date AS itemDate,r.location,r.photo_url AS photoUrl,r.status,r.created_at AS createdAt FROM reports r WHERE 1=1'; const values=[];
  if(filters.q){sql+=' AND (r.title LIKE ? OR r.description LIKE ?)';values.push(`%${filters.q}%`,`%${filters.q}%`);} for(const [key,col] of [['kind','kind'],['category','category'],['location','location'],['date','item_date'],['status','status']]) if(filters[key]){sql+=` AND r.${col}=?`;values.push(filters[key]);}
  sql+=' ORDER BY r.created_at DESC LIMIT 200'; const [rows]=await pool.execute(sql,values);res.json(rows);
}));
app.post('/api/reports',auth,asyncRoute(async(req,res)=>{
  const d=valid(reportSchema,req.body); if(d.kind==='lost'&&d.identifyingDetails) return res.status(400).json({error:'Private identifying details are only for found item reports.'});
  const [r]=await pool.execute('INSERT INTO reports(reporter_id,kind,title,category,description,identifying_details,item_date,location,photo_url) VALUES(?,?,?,?,?,?,?,?,?)',[req.user.id,d.kind,d.title,d.category,d.description,d.kind==='found'?d.identifyingDetails||null:null,d.itemDate,d.location,d.photoUrl||null]);res.status(201).json({id:r.insertId});
}));
app.get('/api/reports/mine',auth,asyncRoute(async(req,res)=>{const [rows]=await pool.execute('SELECT id,kind,title,category,description,identifying_details AS identifyingDetails,item_date AS itemDate,location,photo_url AS photoUrl,status,created_at AS createdAt FROM reports WHERE reporter_id=? ORDER BY created_at DESC',[req.user.id]);res.json(rows);}));
app.put('/api/reports/:id',auth,asyncRoute(async(req,res)=>{
  const d=valid(reportSchema,req.body); if(d.kind==='lost'&&d.identifyingDetails) return res.status(400).json({error:'Private identifying details are only for found item reports.'});
  const [r]=await pool.execute('UPDATE reports SET kind=?,title=?,category=?,description=?,identifying_details=?,item_date=?,location=?,photo_url=? WHERE id=? AND reporter_id=? AND status=\'open\'',[d.kind,d.title,d.category,d.description,d.kind==='found'?d.identifyingDetails||null:null,d.itemDate,d.location,d.photoUrl||null,req.params.id,req.user.id]);if(!r.affectedRows)return res.status(404).json({error:'Open report not found or you do not own it.'});res.json({ok:true});
}));
app.get('/api/claims/mine',auth,asyncRoute(async(req,res)=>{const [rows]=await pool.execute('SELECT c.id,c.report_id AS reportId,r.title AS itemTitle,c.evidence,c.status,c.admin_response AS adminResponse,c.created_at AS createdAt,c.reviewed_at AS reviewedAt FROM claims c JOIN reports r ON r.id=c.report_id WHERE c.claimant_id=? ORDER BY c.created_at DESC',[req.user.id]);res.json(rows);}));
app.post('/api/reports/:id/claims',auth,asyncRoute(async(req,res)=>{
  const {evidence}=valid(z.object({evidence:z.string().trim().min(15).max(1200)}),req.body); const conn=await pool.getConnection();
  try { await conn.beginTransaction(); const [reports]=await conn.execute('SELECT id,kind,reporter_id,status FROM reports WHERE id=? FOR UPDATE',[req.params.id]); if(!reports.length||reports[0].kind!=='found')throw Object.assign(new Error('This found item is no longer available.'),{status:404}); const item=reports[0]; if(item.status==='returned')throw Object.assign(new Error('This item has already been returned.'),{status:409});if(Number(item.reporter_id)===Number(req.user.id))throw Object.assign(new Error('You cannot claim an item you reported as found.'),{status:403});
  const [approved]=await conn.execute("SELECT id FROM claims WHERE report_id=? AND status='approved' FOR UPDATE",[item.id]);if(approved.length)throw Object.assign(new Error('A claim has already been approved for this item.'),{status:409}); const [pending]=await conn.execute("SELECT id FROM claims WHERE report_id=? AND claimant_id=? AND status='pending'",[item.id,req.user.id]);if(pending.length)throw Object.assign(new Error('You already have a pending claim for this item.'),{status:409});const [r]=await conn.execute('INSERT INTO claims(report_id,claimant_id,evidence) VALUES(?,?,?)',[item.id,req.user.id,evidence]);await conn.commit();res.status(201).json({id:r.insertId});
  } catch(e){await conn.rollback();throw e;} finally{conn.release();}
}));
app.get('/api/admin/reports',auth,admin,asyncRoute(async(_req,res)=>{const [rows]=await pool.execute('SELECT r.id,r.kind,r.title,r.category,r.description,r.identifying_details AS identifyingDetails,r.item_date AS itemDate,r.location,r.status,r.reporter_id AS reporterId,u.name AS reporterName FROM reports r JOIN users u ON u.id=r.reporter_id ORDER BY r.created_at DESC');res.json(rows);}));
app.get('/api/admin/claims',auth,admin,asyncRoute(async(_req,res)=>{const [rows]=await pool.execute('SELECT c.id,c.report_id AS reportId,r.title AS itemTitle,c.claimant_id AS claimantId,u.name AS claimantName,c.evidence,c.status,c.admin_response AS adminResponse,c.created_at AS createdAt,c.collected_at AS collectedAt,r.status AS itemStatus FROM claims c JOIN reports r ON r.id=c.report_id JOIN users u ON u.id=c.claimant_id ORDER BY FIELD(c.status,\'pending\',\'approved\',\'rejected\'),c.created_at DESC');res.json(rows);}));
app.post('/api/admin/claims/:id/review',auth,admin,asyncRoute(async(req,res)=>{
 const d=valid(z.object({decision:z.enum(['approved','rejected']),response:z.string().trim().min(5).max(1200)}),req.body);const conn=await pool.getConnection();try{await conn.beginTransaction();const [rows]=await conn.execute('SELECT c.id,c.report_id,c.status,r.status AS itemStatus FROM claims c JOIN reports r ON r.id=c.report_id WHERE c.id=? FOR UPDATE',[req.params.id]);if(!rows.length||rows[0].status!=='pending'||rows[0].itemStatus==='returned')throw Object.assign(new Error('This pending claim can no longer be reviewed.'),{status:409});if(d.decision==='approved'){const [other]=await conn.execute("SELECT id FROM claims WHERE report_id=? AND status='approved'",[rows[0].report_id]);if(other.length)throw Object.assign(new Error('Another claim is already approved for this item.'),{status:409});}await conn.execute('UPDATE claims SET status=?,admin_response=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP() WHERE id=?',[d.decision,d.response,req.user.id,req.params.id]);await conn.commit();res.json({ok:true});}catch(e){await conn.rollback();throw e;}finally{conn.release();}
}));
app.post('/api/admin/claims/:id/return',auth,admin,asyncRoute(async(req,res)=>{const conn=await pool.getConnection();try{await conn.beginTransaction();const [rows]=await conn.execute('SELECT c.id,c.report_id,c.status,r.status AS itemStatus FROM claims c JOIN reports r ON r.id=c.report_id WHERE c.id=? FOR UPDATE',[req.params.id]);if(!rows.length||rows[0].status!=='approved'||rows[0].itemStatus==='returned')throw Object.assign(new Error('Only an approved claim for an open item can be marked returned.'),{status:409});await conn.execute("UPDATE claims SET collected_at=UTC_TIMESTAMP() WHERE id=?",[req.params.id]);await conn.execute("UPDATE reports SET status='returned',returned_at=UTC_TIMESTAMP() WHERE id=?",[rows[0].report_id]);await conn.commit();res.json({ok:true});}catch(e){await conn.rollback();throw e;}finally{conn.release();}}));
app.use((err,_req,res,_next)=>{console.error(err);res.status(err.status||500).json({error:err.status?err.message:'Something went wrong. Please try again.'});});
app.listen(PORT,()=>console.log(`API listening on http://localhost:${PORT}`));

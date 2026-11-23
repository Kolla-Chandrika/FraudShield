const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const PUBLIC = __dirname;
const DATA = path.join(__dirname, 'data.json');

const demoTransactions = [
 {id:'FS-8102',amount:1450,category:'Shopping',merchant:'Nova Market',location:'Hyderabad',hour:14,paymentMethod:'UPI',device:'Known',velocity:1},
 {id:'FS-8103',amount:7800,category:'Electronics',merchant:'TechSquare',location:'Mumbai',hour:2,paymentMethod:'Credit card',device:'New',velocity:4},
 {id:'FS-8104',amount:320,category:'Food',merchant:'Cafe Juniper',location:'Chennai',hour:12,paymentMethod:'Debit card',device:'Known',velocity:1},
 {id:'FS-8105',amount:21900,category:'Transfer',merchant:'Wallet Transfer',location:'Delhi',hour:23,paymentMethod:'UPI',device:'New',velocity:6},
 {id:'FS-8106',amount:2600,category:'Travel',merchant:'Metro Travel',location:'Pune',hour:17,paymentMethod:'UPI',device:'Known',velocity:2},
 {id:'FS-8107',amount:9900,category:'Transfer',merchant:'QuickPay Network',location:'Kolkata',hour:1,paymentMethod:'Credit card',device:'New',velocity:5},
 {id:'FS-8108',amount:890,category:'Health',merchant:'Care Pharmacy',location:'Bengaluru',hour:10,paymentMethod:'Debit card',device:'Known',velocity:1},
 {id:'FS-8109',amount:5400,category:'Groceries',merchant:'Green Basket',location:'Jaipur',hour:20,paymentMethod:'UPI',device:'Known',velocity:2},
 {id:'FS-8110',amount:16700,category:'Transfer',merchant:'External Payee',location:'Lucknow',hour:3,paymentMethod:'UPI',device:'New',velocity:7},
 {id:'FS-8111',amount:1250,category:'Utilities',merchant:'City Power',location:'Ahmedabad',hour:9,paymentMethod:'Debit card',device:'Known',velocity:1},
 {id:'FS-8112',amount:6500,category:'Shopping',merchant:'Fashion Hub',location:'Hyderabad',hour:22,paymentMethod:'Credit card',device:'New',velocity:3},
 {id:'FS-8113',amount:430,category:'Food',merchant:'Urban Deli',location:'Mumbai',hour:13,paymentMethod:'UPI',device:'Known',velocity:1}
];
const defaultState = {transactions:demoTransactions,settings:{maskIdentifiers:true,consentTraining:false,retentionDays:30},events:[{time:new Date().toISOString(),action:'Demo workspace initialized',detail:'Synthetic sample transactions loaded'}]};
function readState(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch{return structuredClone(defaultState)}}
function writeState(s){fs.writeFileSync(DATA,JSON.stringify(s,null,2))}
const sigmoid=x=>1/(1+Math.exp(-Math.max(-30,Math.min(30,x))));
const weights={w1:[[.2,-.1,.3],[.1,.4,-.2],[-.3,.2,.1],[.2,.2,.3]],b1:[0,0,0,0],w2:[.3,-.2,.4,.1],b2:0};
function features(t){return [Math.min(Number(t.amount||0)/20000,1),Number(t.hour)<5||Number(t.hour)>22?1:0,Math.min(Number(t.velocity||1)/7,1)+(t.device==='New'?.2:0)];}
function predict(t){const x=features(t),h=weights.w1.map((row,i)=>sigmoid(row.reduce((s,w,j)=>s+w*x[j],weights.b1[i])));return sigmoid(h.reduce((s,v,i)=>s+v*weights.w2[i],weights.b2));}
function trainSynthetic(){let seed=42;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let epoch=0;epoch<1800;epoch++){let x=[rand(),rand(),rand()],y=(x[0]>.68&&x[1]>.35)||(x[2]>.75)?1:0,h=weights.w1.map((row,i)=>sigmoid(row.reduce((s,w,j)=>s+w*x[j],weights.b1[i]))),p=sigmoid(h.reduce((s,v,i)=>s+v*weights.w2[i],weights.b2)),d=p-y,lr=.09;for(let i=0;i<4;i++){let grad=d*weights.w2[i]*h[i]*(1-h[i]);for(let j=0;j<3;j++)weights.w1[i][j]-=lr*grad*x[j];weights.b1[i]-=lr*grad;weights.w2[i]-=lr*d*h[i]}weights.b2-=lr*d}}
trainSynthetic();
function analyze(t){const score=Math.round(predict(t)*100),risk=score>=70?'High':score>=40?'Medium':'Low';return {score,risk,signals:[...(Number(t.amount)>=7000?['Amount above demo threshold']:[]),...(Number(t.hour)<5||Number(t.hour)>22?['Unusual transaction time']:[]),...(t.device==='New'?['New device']:[]),...(Number(t.velocity)>=4?['Frequent recent transactions']:[])],model:'Synthetic-data neural network demo'};}
function masked(t,settings){const o={...t};if(settings.maskIdentifiers){o.id=String(o.id).replace(/\d+$/,'••••');o.merchant='Merchant '+crypto.createHash('sha256').update(String(t.merchant)).digest('hex').slice(0,5).toUpperCase();o.location='Area-'+crypto.createHash('sha256').update(String(t.location)).digest('hex').slice(0,3).toUpperCase()}return o}
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(obj));}
function readBody(req,cb){let body='';req.on('data',c=>body+=c);req.on('end',()=>{try{cb(null,JSON.parse(body||'{}'))}catch{cb(new Error('Invalid JSON'))}})}
const server=http.createServer((req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
 const url=new URL(req.url,'http://localhost');let state=readState();
 if(req.method==='GET'&&url.pathname==='/api/state'){const scored=state.transactions.map(t=>({...t,...analyze(t)})),stats={total:scored.length,high:scored.filter(t=>t.risk==='High').length,medium:scored.filter(t=>t.risk==='Medium').length,low:scored.filter(t=>t.risk==='Low').length,volume:scored.reduce((a,t)=>a+Number(t.amount),0),flagged:scored.filter(t=>t.risk!=='Low').reduce((a,t)=>a+Number(t.amount),0)};return send(res,200,{transactions:scored.map(t=>masked(t,state.settings)),stats,settings:state.settings,events:state.events.slice(0,10)})}
 if(req.method==='POST'&&url.pathname==='/api/score')return readBody(req,(err,t)=>{if(err)return send(res,400,{error:'Invalid JSON'});if(!Number.isFinite(Number(t.amount))||Number(t.amount)<=0||!Number.isFinite(Number(t.hour))||Number(t.hour)<0||Number(t.hour)>23)return send(res,400,{error:'Enter a valid amount and transaction time.'});t.id=t.id||`FS-${Date.now().toString().slice(-6)}`;const scored={...t,...analyze(t)};state.transactions.unshift(t);state.transactions=state.transactions.slice(0,100);state.events.unshift({time:new Date().toISOString(),action:'Transaction analyzed',detail:`${t.id} received a ${scored.risk} demo risk classification (${scored.score}%)`});writeState(state);send(res,200,{...scored,privacyNote:'Demo only. Avoid entering real banking or personal information.'})});
 if(req.method==='POST'&&url.pathname==='/api/settings')return readBody(req,(err,u)=>{if(err)return send(res,400,{error:'Invalid settings'});state.settings={...state.settings,...u};state.events.unshift({time:new Date().toISOString(),action:'Privacy settings updated',detail:'Workspace privacy preferences changed'});writeState(state);send(res,200,{settings:state.settings})});
 if(req.method==='POST'&&url.pathname==='/api/reset'){state=structuredClone(defaultState);writeState(state);return send(res,200,{ok:true})}
 if(req.method==='GET'&&url.pathname==='/api/export'){return send(res,200,{exportedAt:new Date().toISOString(),privacySettings:state.settings,transactions:state.transactions.map(t=>({...t,...analyze(t)})),events:state.events,notice:'Synthetic sample records only; this is a demonstration export.'})}
 const requested=url.pathname==='/'?'index.html':url.pathname.replace(/^\//,'');const file=path.resolve(PUBLIC,requested);if(file.startsWith(path.resolve(PUBLIC)+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile()){const ext=path.extname(file),mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'}[ext]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime});return fs.createReadStream(file).pipe(res)}send(res,404,{error:'Not found'});
});
server.listen(PORT,()=>console.log(`FraudShield demo is running at http://localhost:${PORT}`));

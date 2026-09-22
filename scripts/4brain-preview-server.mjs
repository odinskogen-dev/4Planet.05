import {createServer} from 'node:http';
import worker from '../ops/brain/4brain-public-worker.js';
const port=Number(process.env.PORT||8787);
createServer(async(req,res)=>{try{const url='http://localhost:'+port+req.url;const r=await worker.fetch(new Request(url,{method:req.method,headers:req.headers}));res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch(err){res.writeHead(500);res.end('Internal test server error');console.error(err);}}).listen(port,'127.0.0.1',()=>console.log('4BRAIN LOCAL PREVIEW READY',port));
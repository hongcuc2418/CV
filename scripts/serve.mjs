import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public');
const portArg=process.argv.indexOf('--port');
const port=Number(portArg>=0?process.argv[portArg+1]:process.env.PORT)||3000;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}const file=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'}).end(file);}catch{res.writeHead(404).end('Not found');}}).listen(port,'0.0.0.0',()=>console.log('CV Atelier ready on port '+port));

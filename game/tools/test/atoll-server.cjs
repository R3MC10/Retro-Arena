// Standalone game server for this worktree. PORT=0 requests an available port.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(req.url.split('?')[0])}catch{res.writeHead(400);res.end();return}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data)});
}).listen(Number(process.env.PORT??8766),'127.0.0.1',function(){console.log('RA_URL=http://127.0.0.1:'+this.address().port+'/index.html')});

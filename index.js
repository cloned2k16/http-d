'use strict';

    var ND
    ,   http_daemon             =   {
                                        Name    :   'http-daemon'
                                    ,   Desc    :   'a very simple http daemon, '
                                                +   'which only rely on http and few more libraries, '    
                                                +   'while can handle multiple static root folders and dynamic pages'
                                    ,   Version :   '0.0.3'    
    }
    ,   fs                      =   require     ('fs')
    ,   http                    =   require     ('http')
    ,   static_folders          =   ['./public_html']
    ,   valid_index_files       =   ['index.html','index.htm']
    ,   port                    =   3000
    ,   _CON                    =   console
    ,   _cout                   =   function    (ch,...a)   { Function.apply.call(ch || _CON.log  ,_CON,a); }
    ,   _log                    =   function    (...a)      { _cout(_CON.log    ,...a); }
    ,   _err                    =   function    (...a)      { _cout(_CON.error  ,...a); }
    ,   fileExt                 =   function    (fn)        {
        var p = fn.lastIndexOf('.')
        ;
        if (p>0) return fn.substring(p);
        else return fn;
    }
    ,   onConnection            =   function    (sock)      { _log('connection',sock.address()); }
    ,   onError                 =   function    (err)       { _err('Error:',err); }
    ,   httpd                   =   http_daemon
    ,   errorPage               =   function    (code,res,baseUrl)  {
            res.staticUrls[baseUrl]=code;
            var i
            ,   count=0
            ,   numBU=0;
            ;
            for ( i in res.staticUrls){
                numBU++;
                var found=res.staticUrls[i];
                if      (found==1) return;                                                              //  skip found somewhere else!
                else if (found!=0) count++;
            }
            if (count < numBU ) return;                                                                 //  still hopes!
            
            res.writeHead(code, {"Content-Type": "text/plain"});                                        //  report HTTP Error code
            switch (code) {
                case 404:
                        res.write("Not Found");
                        break;
                default:
                        res.write("See HTTP Documentation :)");
                        break;
            }    
            res.write('\n');
            res.end();                        
        
    }
    ,   staticLookUp            =   function    (baseUrl,url,res)   {
            var path=baseUrl+url;
            fs.stat(path, function (err, stats) {
                if(err == null) {
                    if (stats.isDirectory()){
                        var ndxFile='index.html';
                        fs.readFile(path+ndxFile, "utf8", function(err, data) {
                            if (err) errorPage(404,res,baseUrl);
                            else {
                                res.write(data);
                                res.end();
                            }    
                        });
                    }
                    else {
                      fs.readFile(path, "utf8", function(err, data) {
                        if (err) errorPage(404,res,baseUrl);
                        else {
                            res.staticUrls[baseUrl]=1; // signal we found it!
                            var ext=fileExt(path);
                            switch (ext){
                                case '.css':
                                    //res.writeHeader(200, {"Content-Type": "text/css"});               // shall we ?
                                    res.setHeader('Content-Type', 'text/css');
                                    break;
                                case '.json':
                                case '.js':
                                    res.setHeader('Content-Type', 'application/javascript');
                                default:    
                            }
                            res.write(data);
                            res.end();
                        }    
                      });  
                    }
                    return;
                } 
                else if(err.code == 'ENOENT') {
                    errorPage(404,res,baseUrl);
                    return;
                } 
                
                _log('unexpected error: ', err);
                res.end("ACCESS DENIED!");
            });
        
    }
    ,   requestHandler          =   function    (req, res)          {  
            var uurl    =   req.url.split('?')
            ,   url     =   uurl[0]
            ,   args    =   uurl[1]
            ,   data
            ;
            if (mapped[url] != ND){
                data = mapped[url](req,res,args);
                res.write(data);
                res.end();
                return;
            } 
            res.staticUrls=[];
            var sf
            ,   urlB;
            
            for ( sf in static_folders) {
                urlB=static_folders[sf];
                res.staticUrls[urlB]=0;
                staticLookUp(urlB,url,res);
            }
            
    }
    ,   server                  =   http.createServer(requestHandler)
    ,   mapped                  =   []
    ;
//  ----------------------------------- --------------------------- ---------------------------------
        httpd.setStaticFolders  =   function    (folders)   {
            static_folders  =   folders;
            
        }
//  ----------------------------------- --------------------------- ---------------------------------
        httpd.map               =   function    (path,cb)   {
            mapped[path]    =   cb;
        }
//  ----------------------------------- --------------------------- ---------------------------------
        httpd.listen            =   function    ()          {
            var a       =arguments
            ,   l       =a.length
            ;
            _log(l);
            if (l >= 1) port     = a[0];
            if (l >= 2) onError  = a[1];
            if (l >= 3) onStart  = a[2];
            
            server.on('clientError' ,onError);
            //server.on('connection'  ,onConnection);
            
            server.listen(port, function () { _log("listening on port:",port); });
            
            
        }  
//  ----------------------------------- --------------------------- ---------------------------------

   
//  ----------------------------------- --------------------------- ---------------------------------
    if (typeof module !== ND && module.exports)  module.exports  = http_daemon;    
//  ----------------------------------- --------------------------- ---------------------------------
    
    
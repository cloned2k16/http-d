'use strict';

    var ND
    ,   http_daemon             =   {
                                        Name    :   'http-daemon'
                                    ,   Desc    :   'a very simple http daemon, '
                                                +   'which only rely on http and few more libraries, '    
                                                +   'while can handle multiple static root folders and dynamic pages'
                                    ,   Version :   '0.0.5'    
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
    ,	textResult				=	function    (res,data){
        res.write(data);
        res.end();
	}
    ,	binaryResult			=	function    (res,data){
		res.setHeader('Accept-Ranges'	, 'bytes');
		res.setHeader('Content-Length'	, data.length);
		res.write(data);
		res.end();

	}
	,	staticLookUp            =   function    (baseUrl,url,res)   {
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
                      fs.readFile(path, function(err, data) {
                        if (err) return errorPage(404,res,baseUrl);
                        else {
                            res.staticUrls[baseUrl]=1; // signal we found it!
                            var ext		=	fileExt(path).substring(1)
							,	isBin	=	true
							;
							res.setHeader('Req-Extension', 	ext);
							
                            switch (ext){
								case 'htm':
								case 'html':
                                    res.setHeader('Content-Type', 	'text/html');
									isBin=false;
                                    break;
                                case 'css':
                                    res.setHeader('Content-Type', 	'text/css');
									isBin=false;
                                    break;
                                case 'json':
									res.setHeader('Content-Type', 	'application/json');
									isBin=false;
                                    break;
                                case 'js':
                                    res.setHeader('Content-Type', 	'application/javascript');
									isBin=false;
									break;	
									

								case 'jpg':
                                    res.setHeader('Content-Type', 'image/jpeg');
									break
								case 'png':
                                    res.setHeader('Content-Type', 'image/png');
									break;
								case 'gif':
                                    res.setHeader('Content-Type', 'image/gif');
									break;
									
                                default:    
									return errorPage(505,res,baseUrl);
                            }
							if (isBin) return binaryResult(res,data);
							else       return textResult  (res,data);
                        }    
                      });  
                    }
                    return;
                } 
                else if(err.code == 'ENOENT') {
                  return errorPage(404,res,baseUrl);
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
            
            server.listen(port, '0.0.0.0', function () { _log("listening on port:",port); });
            
            
        }  
//  ----------------------------------- --------------------------- ---------------------------------

   
//  ----------------------------------- --------------------------- ---------------------------------
    if (typeof module !== ND && module.exports)  module.exports  = http_daemon;    
//  ----------------------------------- --------------------------- ---------------------------------
    
    
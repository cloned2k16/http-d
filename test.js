    var httpd               =   require('./index.js')
    ;
    
    
    console.log(httpd.Name,httpd.Version);
    
    httpd.setStaticFolders  (['./public_html','./js-libs'])
    
    httpd.map               ('/cmmnd'                   ,function (req,res,args) {
       return '[{"v6.10.0":"x64"}]';
    });     
    
    httpd.listen();
    
    
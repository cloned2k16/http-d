    var httpd               =   require('./index.js')
    ;
    
    
    console.log(httpd.Name,httpd.Version);
    
    httpd.setStaticFolders  (['./public_html','./js-libs'])
    
    httpd.map               ('/cmmnd'                   ,function (req,res,args) {
       return '[{"v6.10.0":"x64"}]';
    });     
    
    httpd.map               ('/about'                   ,function (req,res,args) {
       return "Hi i'm "+httpd.Name +'\nversion: '+httpd.Version+'\n'+httpd.Desc;
    });     

    httpd.listen(1111);
    
    
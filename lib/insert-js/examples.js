(function() { 
    var projectId = [YOUR PROJECT ID];
    var protocol = ('https:' == document.location.protocol ? 
    'https://' : 'http://');
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = protocol + 'cdn.optimizely.com/js/' + 
    projectId + '.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(scriptTag, s);
})();

(function(d, t) {
     var c = d.createElement(t),
         s = d.getElementsByTagName(t)[0];
     c.async = 1;
     c.src = '//static.getclicky.com/js';
     s.parentNode.insertBefore(c, s);
 })(document, 'script');

var f=document.getElementsByTagName("script");
var b=f[f.length-1]; 
if(b==null){ return; }
var i=document.createElement("script");
i.language="javascript"; 
i.setAttribute("type","text/javascript");
var j=""; 
j+="document.write('');";
var g=document.createTextNode(j); 
b.parentNode.insertBefore(i,b);
appendChild(i,j);

function appendChild(a,b){
  if(null==a.canHaveChildren||a.canHaveChildren){
    a.appendChild(document.createTextNode(b));
  }
  else{ a.text=b;}
}

(function() {
    function async_load(){
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'http://yourdomain.com/script.js';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
    }
    if (window.attachEvent)
        window.attachEvent('onload', async_load);
    else
        window.addEventListener('load', async_load, false);
})();

(function(d, t) {
     var c = d.createElement(t),
         s = d.getElementsByTagName(t)[0];
     c.async = 1;
     c.src = '//static.getclicky.com/js';
     s.parentNode.insertBefore(c, s);
 })(document, 'script');

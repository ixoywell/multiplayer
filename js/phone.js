var phoneWidth =  parseInt(window.screen.width);
var phoneScale = phoneWidth/640;
var ua = navigator.userAgent;
if (/Android (\d+\.\d+)/.test(ua)){
         var version = parseFloat(RegExp.$1);
if(version>2.3){
   document.write('<meta name="viewport" content="width=640, minimum-scale = '+phoneScale+', maximum-scale = '+phoneScale+'">');
         }else{
  document.write('<meta name="viewport" content="width=640>');
         }
} else {
  document.write('<meta name="viewport" content="width=640, user-scalable=no">');
}
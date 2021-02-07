refreshCSS = () => { 
  let links = document.getElementsByTagName('link'); 
  for (let i = 0; i < links.length; i++) { 
    if (!links[i].hasAttribute('not-reload') && links[i].getAttribute('rel') == 'stylesheet' && links[i].getAttribute('href')) { 
      let href = links[i].getAttribute('href').split('?')[0]; 
      let newHref = href + '?version=' + new Date().getMilliseconds(); 
      links[i].setAttribute('href', newHref); 
    } 
  } 
}

window.onload = ()=>{
  //setInterval(refreshCSS,1000)
}   
var socket = io();
socket.on('refresh-css',()=>{
  console.log("CSS Updated");
  refreshCSS()
})

socket.on('refresh-page',()=>{
  setTimeout(() => {
    location.reload()
  }, 1000);
})
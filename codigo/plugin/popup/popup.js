// async function getCurrentTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }

const buttonStartCollect = document.querySelector('#iniciar-coleta');
const buttonGenerateFile = document.querySelector('#gerar-arquivo');


buttonStartCollect.addEventListener('click', () => {

  const port = chrome.runtime.connect({name: 'Popup'});

  port.postMessage({msg: 'start-extraction'})

  port.onMessage.addListener(src => {
  
      console.log(src);
  
      if(src.msg == 'empty'){
        port.postMessage({msg: 'start-extraction'})
      }
      else{
  
        console.log('Recebido do background', src);
  
        let {estado,tipos,cidade,imoveis} = src;
  
        gerarArquivo(estado,tipos,cidade,imoveis);
  
        port.postMessage({msg: 'start-extraction'});
      }
    })

  // let promessa = getCurrentTab();

  // promessa.then(tab => {
    // chrome.runtime.sendMessage('',{message: 'background'}, response => console.log('Respondi'));
    // chrome.runtime.sendMessage('start-extraction', response => {
    //   // 3. Got an asynchronous response with the data from the service worker
    //   console.log('Status [background]',response);
    //   //initializeUI(response);
    // });
  // });

// });

// buttonGenerateFile.addEventListener('click', () => {

  // let promessa = getCurrentTab();

  // promessa.then(tab => {
    // chrome.runtime.sendMessage('',{message: 'background'}, response => console.log('Respondi'));
  // });
});
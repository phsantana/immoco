// async function getCurrentTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }

const buttonStartCollect = document.querySelector('#iniciar-coleta');
const buttonGenerateFile = document.querySelector('#gerar-arquivo');


buttonStartCollect.addEventListener('click', () => {

  // let promessa = getCurrentTab();

  // promessa.then(tab => {
    // chrome.runtime.sendMessage('',{message: 'background'}, response => console.log('Respondi'));
    chrome.runtime.sendMessage('start-extraction', response => {
      // 3. Got an asynchronous response with the data from the service worker
      console.log('Status [background]',response);
      //initializeUI(response);
    });
  // });
});

buttonGenerateFile.addEventListener('click', () => {

  // let promessa = getCurrentTab();

  // promessa.then(tab => {
    // chrome.runtime.sendMessage('',{message: 'background'}, response => console.log('Respondi'));
    chrome.runtime.sendMessage('generate-file', response => {
      // 3. Got an asynchronous response with the data from the service worker

      console.log(response);

      let {estado,tipos,imoveis} = response;

      gerarArquivo(estado,tipos,imoveis);
      //initializeUI(response);
    });
  // });
});

chrome.runtime.onMessage
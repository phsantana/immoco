var extrairEstado = url => url.split('estado-').pop();
var extrairSlug = (url,uf) => url.split(`/estado-${uf}/`).pop();

var urlBase = 'https://www.olx.com.br/'

const tiposArray = [
	'terrenos',
	'venda'
];

var slugsPorRegiaoArray;

var regioesDOMArray = Array.from(
	document.querySelectorAll('.sc-EHOje.sc-1a202fr-0.dpPMei a'), link => link.href
	);

var regioesArray = regioesDOMArray.map(url => url.split('estado-').pop());

var cidadesObjArray = {};

regioesArray.forEach(uf => {
	cidadesObjArray[uf] = [];
});

function getAllCities(url){
	fetch(url)
	.then(response => response.text())
	.then(response => {
		let htmlPage = new DOMParser().parseFromString(response,'text/html');

		let locationsArray = JSON.parse(htmlPage.querySelector('#initial-data').getAttribute('data-json')).listingProps.dataContext.locations;
		let estadoUrl = extrairEstado(url.split('/').filter(item => item.match(/estado-/)).pop());

		// console.log('locationsArray',locationsArray);

		locationsArray.forEach(locationObj => {
			cidadesObjArray[estadoUrl].push(extrairSlug(`${url}/${locationObj.friendlyName}`,estadoUrl));
		});
	});
}

function deepSearch(surfaceArray){
	console.log('Deep Search');
	surfaceArray.forEach(url => {
		fetch(url)
		.then(response => response.text())
		.then(response => {
			let htmlPage = new DOMParser().parseFromString(response,'text/html');

			let deepUrlArray = Array.from(htmlPage.querySelectorAll('.sc-EHOje.sc-1a202fr-0.dpPMei a'), link => link.href);

			if(deepUrlArray.length){
				// console.log('Going down...');
				deepSearch(deepUrlArray);
			}
			else{
				console.log(
					// 'Klang... deep search stopped',
					'Registro:',url
				);

				console.log('Buscando cidades...');
				getAllCities(url);
			}
		});
	});
}

deepSearch(regioesDOMArray);






var mimeType = 'data:application/json;charset=utf-8,';
var jsonContent = JSON.stringify(cidadesObjArray);
var anchor = document.createElement('a');
anchor.href = mimeType+jsonContent;
anchor.download = 'cidades-mar-2023.json';
anchor.click();
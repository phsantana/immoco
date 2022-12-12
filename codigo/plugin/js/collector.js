// Pesquisar: SPSS (Estatística)
// Coletar toda segunda 


/*
var allLinksArray = generateAllURL('https://@.olx.com.br/');

allLinksArray.forEach(url => {
	fetch(url).then(response => console.log(response.status))
});
*/

var linksDosProdutosArray = [];
var imoveisArray = [];
var paginasComErroArray = [];
var temporizadorRepique = 5000;

var paginacaoInicio = parseInt(window.localStorage.colectorStart) || 1;
var paginacaoFim = parseInt(window.localStorage.colectorEnd) || 100;
var paginaVisitada = '';

const tiposArray = window.localStorage.realEstateType ? [JSON.parse(window.localStorage.realEstateType).shift()] : [
	'terrenos',
	'venda'
];

console.log(
	'Iniciando em:', paginacaoInicio,
	'\nFinalizando em:', paginacaoFim,
	'\nTipos coletados:', tiposArray,
);


const pagesUrlArray = [
'https://am.olx.com.br/regiao-de-manaus/outras-cidades/parintins',
'https://ba.olx.com.br/regiao-de-vitoria-da-conquista-e-barreiras/todas-as-cidades/vitoria-da-conquista',
'https://ce.olx.com.br/regiao-de-juazeiro-do-norte-e-sobral',
'https://mg.olx.com.br/regiao-de-uberlandia-e-uberaba/triangulo-mineiro/ituiutaba',
'https://mg.olx.com.br/regiao-de-uberlandia-e-uberaba/triangulo-mineiro/uberlandia',
'https://ms.olx.com.br/mato-grosso-do-sul/dourados',
'https://pa.olx.com.br/regiao-de-maraba/todas-as-cidades/maraba',
'https://pa.olx.com.br/regiao-de-santarem/todas-as-cidades/santarem',
'https://pb.olx.com.br/paraiba/campina-grande-guarabira-e-regiao/campina-grande',
'https://pr.olx.com.br/regiao-de-maringa/regiao-de-maringa/maringa',
'https://pr.olx.com.br/regiao-de-maringa/regiao-de-maringa/paicandu',
'https://pr.olx.com.br/regiao-de-maringa/regiao-de-maringa/sarandi',
'https://pr.olx.com.br/regiao-de-londrina/regiao-de-londrina/londrina',
'https://rj.olx.com.br/serra-angra-dos-reis-e-regiao/vale-do-paraiba/resende',
'https://rn.olx.com.br/rio-grande-do-norte/outras-cidades/mossoro',
'https://rs.olx.com.br/regioes-de-caxias-do-sul-e-passo-fundo/regiao-de-passo-fundo/passo-fundo',
'https://sc.olx.com.br/oeste-de-santa-catarina/regiao-de-chapeco/chapeco',
'https://sp.olx.com.br/regiao-de-presidente-prudente/regiao-de-aracatuba/aracatuba',
'https://sp.olx.com.br/regiao-de-bauru-e-marilia/regiao-de-bauru/bauru',
'https://sp.olx.com.br/regiao-de-bauru-e-marilia/regiao-de-marilia/marilia',
'https://sp.olx.com.br/regiao-de-presidente-prudente/pres-prudente-aracatuba-e-regiao/presidente-prudente',
'https://sp.olx.com.br/regiao-de-ribeirao-preto/regiao-de-ribeirao-preto/ribeirao-preto',
];

String.prototype.capitalize = function(){
	let firstLetter = this.charAt(0);

	return this.replace(firstLetter, firstLetter.toUpperCase())
}

var filtroColetor = (text,filtro) => {

	let resultado = text.replace(/(&quot;)|(&quot;:)/g,'').split(',').filter(sentence => sentence.match(filtro));

	if(resultado.length)
		return 	resultado
				.pop()
				.replace(filtro,'')
				.replace(/\"|\}/g,'')
				.replace(/\&amp;/,'&')
				.trim()
	else
		return '';
}

var conversorDeData = data => {
	let tempData = data.split(/-/);

	return tempData[2]+'/'+tempData[1]+'/'+tempData[0];
}

function getDate(){
	const dateNow = Date().split(/\s/g);
	return {
		mes: dateNow[1],
		dia: dateNow[2],
		ano: dateNow[3],
		hora: dateNow[4]
	}
}

function invalidType(type){
	const notValidTypesArray = [
	'sítios e chácaras',
	'chácaras',
	'sítios',
	'fazendas'
	];

	return notValidTypesArray.includes(type);
}


//FASE 1
//Coleta das URL's

function coletarUrls(){

		console.log('COLETANDO URLS');

		paginaVisitada = window.location.href;

		tiposArray.forEach(tipo => {
			for(let pagina = paginacaoInicio; pagina <= paginacaoFim; pagina++){		
				fetch(`${paginaVisitada}/imoveis/${tipo}?o=${pagina}`,{
					method: 'GET',
					mode: 'no-cors',
					headers: {'Content-Type': 'text/html'}
				})
				.then(response => response.text())
				.then(htmlPage => {		
					console.log('OK');
					let tempAds = htmlPage.split(/adList|searchCategories/)[1];
					tempAds = tempAds.replace(/(&quot;)|(&quot;:)/g,'');				
					linksDosProdutosArray.push(...tempAds.split(',').filter(items => items.match(/url:/)).map(url => url.replace(/url:/,'')));
				})
				.catch(error => {
					console.error('Error: ',error);
				})
			}
		});
	
		var arrayLength = linksDosProdutosArray.length;
	
		let timer = setInterval(() => {
	
			if(arrayLength < linksDosProdutosArray.length)
				arrayLength = linksDosProdutosArray.length
			else{
	
				if(linksDosProdutosArray.length < 2500){

					console.log('Total de registros:',linksDosProdutosArray.length);

					if(!linksDosProdutosArray.length){
						finalizaColeta();
						clearInterval(timer);
					}

					temporizadorRepique = linksDosProdutosArray.length < 1500 ? 5000 : 30000;
					coletarInformacoesDasPaginas();
					clearInterval(timer);
				}
				else{
					console.log('Número de produtos muito longo:',linksDosProdutosArray.length);
	
					if(tiposArray.length > 1)
						window.localStorage.realEstateType = JSON.stringify(tiposArray)

					else{
						if((paginacaoFim/4) >= 25)
							window.localStorage.colectorEnd = paginacaoFim/4
					}
	
					setTimeout(() => {
						window.location.reload();
					}, 3000);
	
					clearInterval(timer);
				}
			}
		},5000)
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//FASE 2
//Coletar informações das páginas dos produtos


function coletarInformacoesDasPaginas(){

	console.log('COLETANDO INFORMAÇÕES DAS PÁGINAS');

	linksDosProdutosArray.forEach(link => {
		fetch(link,{
			method: 'GET',
			mode: 'no-cors',
			headers: {'Content-Type': 'text/html'}
		})
		.then(response => response.text())
		.then(htmlDaPagina => {
			console.log('OK');
			let docDaPagina = new DOMParser().parseFromString(htmlDaPagina,'text/html');
			let coleta = getDate();
	
			if(!invalidType(filtroColetor(htmlDaPagina,/"real_estate_type":/).toLowerCase())){
				imoveisArray.push({
					tipo: filtroColetor(htmlDaPagina,/"real_estate_type":/),
					dataDoAnuncio: conversorDeData(filtroColetor(htmlDaPagina,/listTime:/).split('T').shift()),
					bairro: filtroColetor(htmlDaPagina,/neighbourhood:/),
					cidade: filtroColetor(htmlDaPagina,/municipality:/),
					estado: filtroColetor(htmlDaPagina,/"state":/),
					preco: filtroColetor(htmlDaPagina,/priceValue:/),
					anunciante: filtroColetor(htmlDaPagina,/"sellerName":/),
					quartos: !filtroColetor(htmlDaPagina,/"real_estate_type":/).toLowerCase().match(/terrenos/) ? filtroColetor(htmlDaPagina,/"rooms":/) : '',
					areaConstruida: filtroColetor(htmlDaPagina,/"size":/) ? (filtroColetor(htmlDaPagina,/"size":/)+"m²") : '',
					url: link,
					dataDaColeta: `${coleta.dia}/${coleta.mes}/${coleta.ano}`,
					horaDaColeta: `${coleta.hora}`
				});
			}
		})
		.catch(error => {
			console.error('Erro na página:',error);
			paginasComErroArray.push(link);
		})
	});

	var arrayLength = imoveisArray.length;

	let timer = setInterval(() => {

		if(arrayLength < imoveisArray.length)
			arrayLength = imoveisArray.length
		else{
			if(paginasComErroArray.length){
				console.log('Paginas com erros restantes',paginasComErroArray.length);
				repiqueControlador()
				clearInterval(timer)
			}
			else{
				gerarArquivo();
				clearInterval(timer)
			}

		}
	},5000)
}

//REPIQUE
function repiqueControlador(){

	// let timer = setInterval(() => {

	if(linksDosProdutosArray)
		linksDosProdutosArray = null;

	setTimeout(() => {
		if(!paginasComErroArray.length)// verificando se está vazio o array de paginas com erro
			eliminarDuplicadas()

		else{
			if(paginasComErroArray.length < 150)
				temporizadorRepique = 5000;

			repique()			
		}
	},temporizadorRepique)
}


function repique(){

	console.log('REPIQUE');

	paginasComErroArray.forEach((link,index) => {
		fetch(link,{
			method: 'GET',
			mode: 'no-cors',
			headers: {'Content-Type': 'text/html'}
		})
		.then(response => response.text())
		.then(htmlDaPagina => {
			console.log('OK');
			let docDaPagina = new DOMParser().parseFromString(htmlDaPagina,'text/html');
			let coleta = getDate();
	
			if(!invalidType(filtroColetor(htmlDaPagina,/"real_estate_type":/).toLowerCase())){
				imoveisArray.push({
					tipo: filtroColetor(htmlDaPagina,/"real_estate_type":/),
					dataDoAnuncio: conversorDeData(filtroColetor(htmlDaPagina,/listTime:/).split('T').shift()),
					bairro: filtroColetor(htmlDaPagina,/neighbourhood:/),
					cidade: filtroColetor(htmlDaPagina,/municipality:/),
					estado: filtroColetor(htmlDaPagina,/"state":/),
					preco: filtroColetor(htmlDaPagina,/priceValue:/),
					anunciante: filtroColetor(htmlDaPagina,/"sellerName":/),
					quartos: !filtroColetor(htmlDaPagina,/"real_estate_type":/).toLowerCase().match(/terrenos/) ? filtroColetor(htmlDaPagina,/"rooms":/) : '',
					areaConstruida: filtroColetor(htmlDaPagina,/"size":/) ? (filtroColetor(htmlDaPagina,/"size":/)+"m²") : '',
					url: link,
					dataDaColeta: `${coleta.dia}/${coleta.mes}/${coleta.ano}`,
					horaDaColeta: `${coleta.hora}`
				});
			}
			paginasComErroArray.splice(index,1);
		})
	});

	repiqueControlador()
}

//Eliminando URL's duplicadas 
function eliminarDuplicadas(){

	console.log('ELIMINANDO DUPLICATAS');

	imoveisArray.forEach(imovel => {
		paginasComErroArray.forEach((link,index,self) => {
			if(imovel.url === link)
				self.splice(index,1)
		})
	});

	setTimeout(() => {
		paginasComErroArray = null;
		gerarArquivo();
	},2000);
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//FASE 3
//Geração do arquivo CSV

function gerarArquivo(){

	console.log('GERANDO ARQUIVO');

	var csvMimeType = 'data:text/csv;charset=utf-8,';
	var csvRowsFileArray = [['tipo','quartos','preço','bairro','cidade','estado','área construida','anunciante','data do anuncio','url','data da coleta','hora da coleta']];
	
	imoveisArray.forEach(imovel => {
		csvRowsFileArray.push([
			imovel.tipo,
			imovel.quartos,
			imovel.preco,
			imovel.bairro,
			imovel.cidade,
			imovel.estado,
			imovel.areaConstruida,
			imovel.anunciante,
			imovel.dataDoAnuncio,
			imovel.url,
			imovel.dataDaColeta,
			imovel.horaDaColeta
		]);
	})
	
	let csvContent = csvMimeType + csvRowsFileArray.map(e => e.join(",")).join("\n");
	
	const estado = paginaVisitada.split(/\//g)[2].split(/\./).shift().toUpperCase();
	var parte = '';

	if((paginacaoInicio === 1) && (paginacaoFim === 50))
		parte += ' - pt1'

	if((paginacaoInicio === 51) && (paginacaoFim === 100))
		parte += ' - pt2'

	if((paginacaoInicio === 1) && (paginacaoFim === 25))
		parte += ' - pt1'

	if((paginacaoInicio === 26) && (paginacaoFim === 50))
		parte += ' - pt2'

	if((paginacaoInicio === 51) && (paginacaoFim === 75))
		parte += ' - pt3'

	if((paginacaoInicio === 76) && (paginacaoFim === 100))
		parte += ' - pt4'


	const fileName = paginaVisitada.split(/\//).pop().capitalize() + ((!tiposArray.includes('terrenos') ? ' (imóveis)' : '') || (!tiposArray.includes('venda') ? ' (terrenos)' : ''));
	
	let link = document.createElement('a');
	link.download = `${estado} - ${fileName} - ${getDate().dia}-${getDate().mes}-${getDate().ano}${parte}.csv`;
	link.href = csvContent;
	link.click();

	finalizaColeta();
}

function finalizaColeta(){

	linksDosProdutosArray = null;
	imoveisArray = null;

	if(paginacaoFim < 100){
		window.localStorage.colectorStart = paginacaoFim+1;
		window.localStorage.colectorEnd = paginacaoFim+(paginacaoFim-(paginacaoInicio-1));

		setTimeout(() => {
			window.location.reload();
		}, 3000);
	}
	else{
		window.localStorage.colectorStart = 1;
		window.localStorage.colectorEnd = 100;

		if(window.localStorage.realEstateType && (JSON.parse(window.localStorage.realEstateType).length > 1)){
			window.localStorage.realEstateType = JSON.stringify([JSON.parse(window.localStorage.realEstateType).pop()]);

			setTimeout(() => {
				window.location.reload();
			}, 3000);
		}
		else{
			window.localStorage.realEstateType = ''

			setTimeout(() => {
				let currentUrlIndex = pagesUrlArray.findIndex(url => url.match(paginaVisitada));
		
				if(pagesUrlArray[currentUrlIndex+1])
					window.location.href = pagesUrlArray[currentUrlIndex+1];
		
			}, 3000)
		}
	}
}


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------


window.addEventListener('load', () => {
	coletarUrls()
})
var slugsPorRegiaoArray = null;
var socket;
var cidade;
var regioesArray;
var tempoParaGerarArquivo;

function validSlug(slug){
	let slugBodyArray = slug.split('/');
	let indicator = slug.split('/').pop();

	return !(slugBodyArray.filter(urlPart => urlPart == indicator).length > 1)
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

function invalidType(type){
	const notValidTypesArray = [
	'sítios e chácaras',
	'chácaras',
	'sítios',
	'fazendas'
	];

	return notValidTypesArray.includes(type);
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

var conversorDeData = data => {
	let tempData = data.split(/-/);

	return tempData[2]+'/'+tempData[1]+'/'+tempData[0];
}

const getCityName = slug => slug.split('/').pop();

var linksDosProdutosArray = [];
var imoveisArray = [];
var paginasComErroArray = [];
var unsavedDataArray = [];

const urlBase = 'https://www.olx.com.br';

const tiposArray = [
	'terrenos',
	'venda'
	];

const eliminateDoubledElements = refArray => {
	refArray.forEach((item,index,self) => {
		let duplicatasArray = self.filter(i => item == i);

		if(duplicatasArray.length > 1)
			for(let i = 1; i < duplicatasArray.length; i++)
				self.splice(self.indexOf(duplicatasArray[i]),1);
	})
}

function coletarUrls(slug,uf){

		console.log('COLETANDO URLS');

		cidade = getCityName(slug);

		console.log('Estado coletado',uf);
		console.log('Cidade coletada', cidade);

		tiposArray.forEach(tipo => {
			for(let pagina = 1; pagina <= 100; pagina++){
				fetch(`${urlBase}/imoveis/${tipo}/estado-${uf}/${slug}?o=${pagina}`,{
					method: 'GET',
					// mode: 'no-cors',
					headers: {'Content-Type': 'text/html'}
				})
				.then(response => response.text())
				.then(htmlPage => {		
					// console.log('OK');
					// console.log(htmlPage);
					let listItemsArray = htmlPage.split(/trackingSpecificData/);


					if(listItemsArray.length > 1){
						listItemsArray.shift();
						listItemsArray = listItemsArray.map(link =>
							link.split(/url/)
							.pop()
							.split(/\"/)[2]
						);

						listItemsArray = listItemsArray.filter(item => item.match('olx.com.br'))

						// console.log(listItemsArray);

						linksDosProdutosArray.push(...listItemsArray);
					}
					// let tempAds = htmlPage.split(/adList|searchCategories/)[1];
					// tempAds = tempAds.replace(/(&quot;)|(&quot;:)/g,'');
					// linksDosProdutosArray.push(...tempAds.split(',').filter(items => items.match(/url:/)).map(url => url.replace(/url:/,'')));
				})
				.catch(error => {
					console.error('Error: ',error);
				});
			}
		});
	
		var arrayLength = linksDosProdutosArray.length;
	
		let timer = setInterval(() => {
	
			if(arrayLength < linksDosProdutosArray.length)
				arrayLength = linksDosProdutosArray.length
			else{
				console.log('Total de registros:', linksDosProdutosArray.length);

				linksDosProdutosArray.forEach((link,index,self) => {
					let duplicatasArray = self.filter(l => l==link);

					if(duplicatasArray.length > 1)
						console.log('Link duplicado',link);
				});

				tempoParaGerarArquivo = linksDosProdutosArray.length;
				coletarInformacoesDasPaginas();
				clearInterval(timer);
			}
		},5000);
}

function coletarInformacoesDasPaginas(){

	console.log('COLETANDO INFORMAÇÕES DAS PÁGINAS');

	// console.log(linksDosProdutosArray);

	linksDosProdutosArray.forEach(link => {
		fetch(link,{
			method: 'GET',
			headers: {'Content-Type': 'text/html'}
		})
		.then(response => response.text())
		.then(htmlDaPagina => {
			// console.log('OK', link);
			let coleta = getDate();

			// console.log(htmlDaPagina);
	
			if(!invalidType(filtroColetor(htmlDaPagina,/"real_estate_type":/).toLowerCase())){
				fetch('http://localhost:3000/add-data',{
					method: 'POST',
					headers: {'Content-Type': 'application/json; charset=UTF-8'},
					body: JSON.stringify({
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
					})
				});
			}
		})
		.catch(error => {
			console.error('Erro na página:',error);
			paginasComErroArray.push(link);
		})
	});

	let timer = setInterval(() => {
		
			if(paginasComErroArray.length){
				console.log('Paginas com erros restantes',paginasComErroArray.length);
				// console.log(paginasComErroArray);
				repiqueControlador()
				clearInterval(timer)
			}
			else{
				// gerarArquivo(imoveisArray,currentState,nomeCidade);
				console.log('BUSCA FINALIZADA');

				let estado = regioesArray[0];

				if(linksDosProdutosArray.length){
					linksDosProdutosArray = [];
	
					fetch('http://localhost:3000/'+estado)
  					.then(response => response.json())
  					.then(res => {
  						finalizaBusca(estado,tiposArray,cidade,res);
  					});
	
					clearInterval(timer)
				}
				else{
					socket.postMessage({msg: 'empty'});
					clearInterval(timer);
				}
			}

		// }
	},5000);
}

//REPIQUE
function repiqueControlador(){

	linksDosProdutosArray = [];
	console.log('Páginas restantes:', paginasComErroArray.length);

	let intervalo = 30000;

	if((paginasComErroArray.length > 500) && (paginasComErroArray.length <= 900)){
			intervalo = 10000;
			// console.log('Intervalo de 10 segundos');
	}

	if(paginasComErroArray.length <= 500){
		intervalo = 5000;
		// console.log('Intervalo de 5 segundos');
	}

	setTimeout(() => {
		if(!paginasComErroArray.length)// verificando se está vazio o array de paginas com erro
			eliminarDuplicadasDoServidor(imoveisArray);

		else
			repique();
	},intervalo);
}


function repique(){

	console.log('REPIQUE');

	paginasComErroArray.forEach((link,index) => {
		fetch(link,{
			method: 'GET',
			headers: {'Content-Type': 'text/html'}
		})
		.then(response => response.text())
		.then(htmlDaPagina => {
			// console.log('OK',link);
			let coleta = getDate();
	
			if(!invalidType(filtroColetor(htmlDaPagina,/"real_estate_type":/).toLowerCase())){
				fetch('http://localhost:3000/add-data',{
					method: 'POST',
					headers: {'Content-Type': 'application/json; charset=UTF-8'},
					body: JSON.stringify({
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
					})
				});
			}
			paginasComErroArray.splice(index,1);
		})
		.catch(error => {
			console.error('Erro na página:',error);
		})
	});

	repiqueControlador()
}

//Eliminando URL's duplicadas do servidor
function eliminarDuplicadasDoServidor(imoveis){

	console.log('ELIMINANDO DUPLICATAS');

	let estado = regioesArray[0];

	fetch('http://localhost:3000/eliminate-doubled',{method: 'POST'})
	.then(response => response.text())
	.then(response => {

		console.log(response);

		setTimeout(() => {
			paginasComErroArray = [];
			console.log('FINALIZANDO BUSCA');
	
			fetch('http://localhost:3000/'+estado)
  			.then(response => response.json())
  			.then(res => {

  				console.log('Dados a serem enviados',res);

  				finalizaBusca(estado,tiposArray,cidade,res);
  			});
		},tempoParaGerarArquivo);
	});
}

function salvarDadosNoServidor(imoveis){
	let estado = regioesArray[0];

	imoveis.forEach(imovel => {
        fetch('http://localhost:8000/add-imovel',{
			method: 'POST',
            body: JSON.stringify(imovel),
			headers: {'Content-Type': 'application/json; charset=UTF-8'}
		})
		.then(r => console.log(r))
		.catch(error => {
			console.error('Erro no envio ao servidor:',error);
			unsavedDataArray.push(link);
		});
  	});

  	//Finaliza busca e gera arquivo
  	// finalizaBusca(estado,tiposArray,cidade,imoveis);

  	let timer = setInterval(() => {
		if(unsavedDataArray.length)
			salvarDadosNoServidor(unsavedDataArray);
		else{
			finalizaBusca(estado,tiposArray,cidade,imoveis);
			clearInterval(timer);
		}
	},5000);
}

function repiqueBancoDeDados(){
	unsavedDataArray.forEach((imovel,index) => {
        fetch('http://localhost:8000/add-imovel',{
			method: 'POST',
            body: JSON.stringify(imovel),
			headers: {'Content-Type': 'application/json; charset=UTF-8'}
		})
		.then(r => {
			unsavedDataArray.splice(index,1);
		})
		.catch(error => {
			console.error('Erro no envio ao servidor:',error);
		});
  	});

}

function verificarDuplicidadeNoServidor(imovelUrl1,imovelUrl2){

}

function finalizaBusca(estado,tipos,city,imoveis){
	console.log('Finaliza busca');
	socket.postMessage({
  		estado: estado,
  		tipos: tipos,
  		cidade: city,
  		imoveis: imoveis
  	});
}

chrome.runtime.onConnect.addListener(port => {

	if(port.name === 'Popup'){

		socket = port;

		port.onMessage.addListener(src => {
	// })
	
	// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  	// 2. A page requested user data, respond with a copy of `user`
  			if (src.msg === 'start-extraction'){
    			// sendResponse(user);

    			if(!slugsPorRegiaoArray){
    				slugsPorRegiaoArray = src.slugs;
    				regioesArray = Object.keys(slugsPorRegiaoArray);
    			}

    			fetch('http://localhost:3000/clear',{
    				method: 'POST'
    			})
    			.then(response => response.text())
    			.then(response => console.log(response));

    			if(regioesArray.length){ //existem estados a serem coletados?
    				if(!slugsPorRegiaoArray[regioesArray[0]].length) //tem urls a serem coletadas neste estado?
    					// Não existem mais URLs neste estado
						regioesArray.shift();

					if(regioesArray.length){
						let slug = slugsPorRegiaoArray[regioesArray[0]].shift();
	
						if(validSlug(slug)){
							let uf = regioesArray[0];
		
							let timer = setInterval(() => {
		
								fetch('http://localhost:3000/check-status')
								.then(response => response.text())
								.then(response => {
									let taskServer = parseInt(response);
		
									console.log('Status do servidor:',taskServer);
		
									if(!taskServer){
										coletarUrls(slug,uf);
										clearInterval(timer);
									}
									else{
										console.log('Reiniciando servidor...');
										fetch('http://localhost:3000/clear',{
											method: 'POST'
										})
										.then(response => response);
									}
								})
							},5000);
						}
						else{
							console.log(
								'Invalid slug',
								'\nSlug:', slug
							);
	
							socket.postMessage({msg: 'empty'});
						}
					}
					else
						socket.disconnect();
    			} // fim se existem estados a serem coletados
    			else
    				socket.disconnect();
  			}
		})
	}
});
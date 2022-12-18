String.prototype.capitalize = function(){
	let firstLetter = this.charAt(0);

	return this.replace(firstLetter, firstLetter.toUpperCase())
}

var getCityName = slug => slug.split(/\//).pop();

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

//Eliminando URL's duplicadas 
function eliminarDuplicadas(imoveis){

	console.log('ELIMINANDO DUPLICATAS');

	imoveis.forEach(imovel => {
		paginasComErroArray.forEach((link,index,self) => {
			if(imovel.url === link)
				self.splice(index,1)
		})
	});

	setTimeout(() => {
		paginasComErroArray = null;
		gerarArquivo(imoveis);
	},2000);
}

function flushArrays(...a){
	a.forEach(b => {
		b = null;
	})
}

function goToNextPage(currentPage){

}

function isEmpty(a){
	return a.length
}

function setStatesToBeVisit(){
	if(!window.localStorage.statesToBeVisit || !isEmpty(JSON.parse(window.localStorage.statesToBeVisit)))
		window.localStorage.statesToBeVisit = JSON.stringify([
			'am',
			'ba',
			'ce',
			'mg',
			'pa',
			'pb',
			'pr',
			'rj',
			'rn',
			'rs',
			'sc',
			'sp'
		]);
}

function getStateToBeVisit(){
	let statesArray = JSON.parse(window.localStorage.statesToBeVisit);

	if(statesArray.length){
		let stateToVisit = statesArray.shift();
		return stateToVisit;
	}
	else{
		alert('Busca concluída');
	}
}

function setSlugs(){
	if(!window.localStorage.slugsToBeVisit || !isEmpty(JSON.parse(window.localStorage.slugsToBeVisit)))
		window.localStorage.slugsToBeVisit = JSON.stringify({
	am: [
		'regiao-de-manaus/outras-cidades/parintins'
		],
	ba: [
		'regiao-de-vitoria-da-conquista-e-barreiras/todas-as-cidades/vitoria-da-conquista'
		],
	ce: [
		'regiao-de-juazeiro-do-norte-e-sobral'
		],
	mg: [
		'regiao-de-uberlandia-e-uberaba/triangulo-mineiro/ituiutaba',
		'regiao-de-uberlandia-e-uberaba/triangulo-mineiro/uberlandia'
		],
	ms: [
		'mato-grosso-do-sul/dourados'
		],
	pa: [
		'regiao-de-maraba/todas-as-cidades/maraba',
		'regiao-de-santarem/todas-as-cidades/santarem'
		],
	pb: [
		'paraiba/campina-grande-guarabira-e-regiao/campina-grande'
		],
	pr: [
		'regiao-de-maringa/regiao-de-maringa/maringa',
		'regiao-de-maringa/regiao-de-maringa/paicandu',
		'regiao-de-maringa/regiao-de-maringa/sarandi',
		'regiao-de-londrina/regiao-de-londrina/londrina'
		],
	rj: [
		'serra-angra-dos-reis-e-regiao/vale-do-paraiba/resende'
		],
	rn: [
		'rio-grande-do-norte/outras-cidades/mossoro'
		],
	rs: [
		'regioes-de-caxias-do-sul-e-passo-fundo/regiao-de-passo-fundo/passo-fundo'
		],
	sc: [
		'oeste-de-santa-catarina/regiao-de-chapeco/chapeco'
		],
	sp: [
		'regiao-de-presidente-prudente/regiao-de-aracatuba/aracatuba',
		'regiao-de-bauru-e-marilia/regiao-de-bauru/bauru',
		'regiao-de-bauru-e-marilia/regiao-de-marilia/marilia',
		'regiao-de-presidente-prudente/pres-prudente-aracatuba-e-regiao/presidente-prudente',
		'regiao-de-ribeirao-preto/regiao-de-ribeirao-preto/ribeirao-preto'
		]
	});
}

function getSlugToBeVisit(state){
	let slugsObjArray = JSON.parse(window.localStorage.slugsToBeVisit);

	if(slugsObjArray && slugsObjArray){
		let slugToBeVisit = slugsObjArray[state].shift();
		return slugToBeVisit;
	}
	else{
		alert('Busca concluída');
	}
}

function updateDataStorage(state){
	let statesArray = JSON.parse(window.localStorage.statesToBeVisit);
	let slugsObjArray = JSON.parse(window.localStorage.slugsToBeVisit);

	slugsObjArray[state].shift();
	statesArray.shift();

	window.localStorage.slugsToBeVisit = JSON.stringify(slugsObjArray);
	window.localStorage.statesToBeVisit = JSON.stringify(statesArray);
}
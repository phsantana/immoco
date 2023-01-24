//FASE 3
//Geração do arquivo CSV

// function gerarArquivo(imoveis,estado,cidade){

// 	console.log('GERANDO ARQUIVO');

// 	var csvMimeType = 'data:text/csv;charset=utf-8,';
// 	var csvRowsFileArray = [['tipo','quartos','preço','bairro','cidade','estado','área construida','anunciante','data do anuncio','url','data da coleta','hora da coleta']];
	
// 	imoveis.forEach(imovel => {
// 		csvRowsFileArray.push([
// 			imovel.tipo,
// 			imovel.quartos,
// 			imovel.preco,
// 			imovel.bairro,
// 			imovel.cidade,
// 			imovel.estado,
// 			imovel.areaConstruida,
// 			imovel.anunciante,
// 			imovel.dataDoAnuncio,
// 			imovel.url,
// 			imovel.dataDaColeta,
// 			imovel.horaDaColeta
// 		]);
// 	})
	
// 	let csvContent = csvMimeType + csvRowsFileArray.map(e => e.join(",")).join("\n");
	
// 	var parte = '';

// 	if((paginacaoInicio === 1) && (paginacaoFim === 50))
// 		parte += ' - pt1'

// 	if((paginacaoInicio === 51) && (paginacaoFim === 100))
// 		parte += ' - pt2'

// 	if((paginacaoInicio === 1) && (paginacaoFim === 25))
// 		parte += ' - pt1'

// 	if((paginacaoInicio === 26) && (paginacaoFim === 50))
// 		parte += ' - pt2'

// 	if((paginacaoInicio === 51) && (paginacaoFim === 75))
// 		parte += ' - pt3'

// 	if((paginacaoInicio === 76) && (paginacaoFim === 100))
// 		parte += ' - pt4'


// 	const fileName = cidade.capitalize() + ((!tiposArray.includes('terrenos') ? ' (imóveis)' : '') || (!tiposArray.includes('venda') ? ' (terrenos)' : ''));
	
// 	let link = document.createElement('a');
// 	link.download = `${estado.toUpperCase()} - ${fileName} - ${getDate().dia}-${getDate().mes}-${getDate().ano}${parte}.csv`;
// 	link.href = csvContent;
// 	link.click();

// 	finalizaColeta();
// }

function gerarArquivo(estado,tipos,imoveis){

	console.log('GERANDO ARQUIVO');

	var csvMimeType = 'data:text/csv;charset=utf-8,';
	var csvRowsFileArray = [['tipo','quartos','preço','bairro','cidade','estado','área construida','anunciante','data do anuncio','url','data da coleta','hora da coleta']];
	
	imoveis.forEach(imovel => {
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
	});

	tipos = tipos.length > 1 ? tipos.join(',') : tipos.pop();
	
	let csvContent = csvMimeType + csvRowsFileArray.map(e => e.join(",")).join("\n");
	
	let link = document.createElement('a');
	link.download = `${estado.toUpperCase()} - (${tipos}) - ${getDate().dia}-${getDate().mes}-${getDate().ano}.csv`;
	link.href = csvContent;
	link.click();
}
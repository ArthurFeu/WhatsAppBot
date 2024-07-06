const fs = require('fs');
const csv = require('csv-parser');

let produtos = [];

fs.createReadStream('produtos.csv')
	.pipe(csv())
	.on('data', (row) => {
		row.precoUnidade = parseFloat(row.precoUnidade);
		row.estoque = JSON.parse(row.estoque);
		produtos.push(row);
	})
	.on('end', () => {
		console.log('=== TABELA DE DADOS PROCESSADA ===');
	});

module.exports = produtos;

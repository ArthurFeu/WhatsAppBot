const mensagens = require('./mensagens');
const produtos = require('./produtos');

const atualizaEstado = (contato, userState, novoEstado) => {
	userState[contato].step = novoEstado;
}

const listaLuvas = (item, index) => {
	let listaLuvas = "";
	let tamanhos = Object.keys(item.estoque).filter(tamanho => item.estoque[tamanho] > 0);
	listaLuvas += `${index + 1} - ${item.nome} - Preço: R$${item.precoUnidade.toFixed(2)} - Tamanhos: ${tamanhos}\n`;
	return listaLuvas;
}

const listaProdutos = (item, index) => {
	let listaProdutos = "";
	listaProdutos += `${index + 1} - ${item.nome} - Preço: R$${item.precoUnidade.toFixed(2)} - Estoque: ${item.estoque}\n`;
	return listaProdutos;
}

const trataOpcoesIniciais = (userMessage, contato, client, userState) => {
	switch (userMessage) {
		case "1":
			const luvas = produtos.filter(p => p.tipo === 'luva');
			let responseLuvas = 'Aqui estão as luvas disponíveis:\n';

			luvas.forEach((luva, index) => {
				responseLuvas += listaLuvas(luva, index);
			});

			client.sendMessage(contato, responseLuvas);
			atualizaEstado(contato, userState, 2);
			break;

		case "2":
			const outrosProdutos = produtos.filter(p => p.tipo !== 'luva');
			let responseProdutos = 'Aqui estão os outros produtos disponíveis:\n';

			outrosProdutos.forEach(produto => {
				responseProdutos += listaProdutos(produto);
			});

			client.sendMessage(contato, responseProdutos);
			atualizaEstado(contato, userState, 3);
			break;

		case "3":
			client.sendMessage(contato, mensagens.opcoes.notafiscal);
			atualizaEstado(contato, userState, 4);
			break;

		case "4":
			client.sendMessage(contato, mensagens.opcoes.atendente);
			atualizaEstado(contato, userState, 5);
			break;

		default:
			client.sendMessage(contato, mensagens.opcoes.invalida);
			client.sendMessage(contato, mensagens.opcoesIniciais);
			break;
	}
};

const trataSelecaoDeLuvas = (userMessage, contato, client, userState) => {
	const luvas = produtos.filter(p => p.tipo === 'luva');
	const indexEscolhido = parseInt(userMessage) - 1;

	if (indexEscolhido >= 0 && indexEscolhido < luvas.length) {
		const luvaEscolhida = luvas[indexEscolhido];

		const tamanhosDisponiveis = Object.keys(luvaEscolhida.estoque).filter(tamanho => luvaEscolhida.estoque[tamanho] > 0);


		let response = `Você escolheu ${luvaEscolhida.nome}. Tamanhos disponíveis: ${tamanhosDisponiveis.join(', ')}. Por favor, escolha um tamanho.`;

		client.sendMessage(contato, response);
		atualizaEstado(contato, userState, 6);
		userState[contato].produto = luvaEscolhida;
	} else {
		client.sendMessage(contato, mensagens.resetar);
	}
};


const trataTamanhoEscolhido = (userMessage, contato, client, userState) => {
	const tamanhos = Object.keys(userState[contato].produto.estoque);
	const tamanhoEscolhido = tamanhos.includes(userMessage.toUpperCase());
	if (tamanhoEscolhido) {
		userState[contato].produto.tamanho = userMessage.toUpperCase();
		client.sendMessage(contato, `Obrigado! Registramos que você precisa de luvas tamanho ${userMessage.toUpperCase()}. Por favor, escolha a quantidade.`);
		atualizaEstado(contato, userState, 7); // Resetar estado após finalizar o fluxo
	} else {
		client.sendMessage(contato, 'Tamanho inválido. Por favor, escolha um tamanho válido.');
	}
};

const trataQuantidadeEscolhida = (userMessage, contato, client, userState) => {
	const quantidadeEscolhida = parseInt(userMessage);
	const estoqueTotal = userState[contato].produto.estoque;
	const estoqueDisponivel = estoqueTotal[userState[contato].produto.tamanho];

	if (Number.isInteger(quantidadeEscolhida)) {
		if (quantidadeEscolhida <= estoqueDisponivel) {
			userState[contato].produto.quantidade = quantidadeEscolhida;
			userState[contato].produto.valorTotalProduto = userState[contato].produto.precoUnidade * quantidadeEscolhida;
			client.sendMessage(contato, `Você escolheu ${quantidadeEscolhida} luvas.\nResumo do produto escolhido:`);

			client.sendMessage(contato, exibeProduto(userState[contato].produto));

			client.sendMessage(contato, 'Confirme se deseja adicionar ao carrinho. Digite "sim" ou "não".');
			atualizaEstado(contato, userState, 8); // Confirmar produto no carrinho
		} else {
			client.sendMessage(contato, `Desculpe, temos apenas ${estoqueDisponivel} luvas disponíveis. Digite um valor dentro do estoque disponível, por favor.`);
		}
	} else {
		client.sendMessage(contato, 'Por favor, digite um número.');
	}
}

const exibeProduto = (objetoProduto) => {
	return `Produto: ${objetoProduto.nome}\nTamanho: ${objetoProduto.tamanho}\n\nPreço unitário: R$${objetoProduto.precoUnidade.toFixed(2)}\nQuantidade: ${objetoProduto.quantidade}\n\nR$${(objetoProduto.valorTotalProduto).toFixed(2)}`;
}



const trataConfirmacaoDeItem = (userMessage, contato, client, userState) => {
	if (userMessage === 'sim') {
		userState[contato].carrinho.push(userState[contato].produto);
		client.sendMessage(contato, 'Produto adicionado ao carrinho com sucesso!');
		client.sendMessage(contato, mensagens.opcoesAposPrimeiroPedido);
		atualizaEstado(contato, userState, 9); // Voltar para o menu inicial
	} else if (userMessage === 'não') {
		client.sendMessage(contato, 'Produto não adicionado ao carrinho. Opções disponíveis:');
		client.sendMessage(contato, mensagens.opcoesIniciais);
		atualizaEstado(contato, userState, 1); // Voltar para o menu inicial
	} else {
		client.sendMessage(contato, 'Por favor, digite "sim" ou "não". Deseja adicionar ao carrinho?');
	}
}

const trataAposPrimeiroItemAdicionado = (userMessage, contato, client, userState) => {
	switch (userMessage) {
		case "1":
			const luvas = produtos.filter(p => p.tipo === 'luva');
			let responseLuvas = 'Aqui estão as luvas disponíveis:\n';

			luvas.forEach((luva, index) => {
				responseLuvas += listaLuvas(luva, index);
			});

			client.sendMessage(contato, responseLuvas);
			atualizaEstado(contato, userState, 2);
			break;

		case "2":
			const outrosProdutos = produtos.filter(p => p.tipo !== 'luva');
			let responseProdutos = 'Aqui estão os outros produtos disponíveis:\n';

			outrosProdutos.forEach(produto => {
				responseProdutos += listaProdutos(produto);
			});

			client.sendMessage(contato, responseProdutos);
			atualizaEstado(contato, userState, 3);
			break;

		case "3":
			let responseCarrinho = 'Aqui está o seu carrinho:\n';
			let valorTotalPedido = 0;
			userState[contato].carrinho.forEach(produto => {
				valorTotalPedido += produto.valorTotalProduto;
			});

			userState[contato].carrinho.forEach(produto => {
				responseCarrinho += "\n*=================*\n\n";
				responseCarrinho += exibeProduto(produto);
				responseCarrinho += "\n";
			});
			responseCarrinho += `\n*=================*\n\nValor total do pedido: *R$${valorTotalPedido.toFixed(2)}*`;

			client.sendMessage(contato, responseCarrinho);


			client.sendMessage(contato, 'Deseja finalizar o pedido? Digite "sim" ou "não".');
			atualizaEstado(contato, userState, 10);
			break;

		case "4":
			client.sendMessage(contato, mensagens.opcoes.atendente);
			atualizaEstado(contato, userState, 5);
			break;

		default:
			client.sendMessage(contato, mensagens.opcoes.invalida);
			client.sendMessage(contato, mensagens.opcoesAposPrimeiroPedido);
			break;

	}
}

const trataFechamentoDePedido = (userMessage, contato, client, userState) => {
	if (userMessage === 'sim') {
		client.sendMessage(contato, 'Certo, digite seu endereço para negociarmos a entrega:');
		atualizaEstado(contato, userState, 11); // Finalizar pedido com endereço de entrega

	} else if (userMessage === 'não') {
		client.sendMessage(contato, 'Pedido não finalizado. Opções disponíveis:');
		client.sendMessage(contato, mensagens.opcoesAposPrimeiroPedido);
		atualizaEstado(contato, userState, 9); // Voltar para o menu inicial
	} else {
		client.sendMessage(contato, 'Por favor, digite "sim" ou "não". Deseja finalizar o pedido?');
	}
}

const trataEntregaDePedido = (userMessage, contato, client, userState) => {
	if (userMessage.length > 0) {
		client.sendMessage(contato, "Obrigado! Um atendente irá combinar a entrega com você em breve. Obrigado por comprar com a SupriLab!");
		atualizaEstado(contato, userState, 0); // Voltar para o menu inicial
		userState[contato].carrinho = []; // Limpar carrinho
	}
}


const trataRecebimentoDeNotaFiscal = (userMessage, contato, client, userState) => {
	client.sendMessage(contato, "TODO");
}

const trataSelecaoDeProdutos = (userMessage, contato, client, userState) => {
	const outrosProdutos = produtos.filter(p => p.tipo !== 'luva');
	const indexEscolhido = parseInt(userMessage);

	if (indexEscolhido >= 0 && indexEscolhido < outrosProdutos.length) {
		const produtoEscolhido = outrosProdutos[indexEscolhido];

		let response = `Você escolheu ${produtoEscolhido.nome}. Preço: R$${produtoEscolhido.precoUnidade.toFixed(2)}.`;

		client.sendMessage(contato, response);
		atualizaEstado(contato, userState, 8); // Confirmar produto no carrinho
	} else {
		client.sendMessage(contato, mensagens.resetar);
	}
};


module.exports = {
	trataOpcoesIniciais,
	trataSelecaoDeLuvas,
	trataSelecaoDeProdutos,
	trataRecebimentoDeNotaFiscal,
	trataTamanhoEscolhido,
	trataQuantidadeEscolhida,
	trataConfirmacaoDeItem,
	trataAposPrimeiroItemAdicionado,
	trataFechamentoDePedido,
	trataEntregaDePedido
};

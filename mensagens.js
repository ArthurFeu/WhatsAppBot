const mensagens = {
	ola: "Olá, sou a Supri, assistente virtual da SupriLab! Como posso te ajudar?",
	opcoesIniciais:
		"1. Comprar luvas \n" +
		"2. Comprar outros produtos -- INCOMPLETA\n" +
		"3. Quero receber a minha Nota Fiscal de um pedido anterior  -- INCOMPLETA\n" +
		"4. Falar com um atendente",

	opcoesAposPrimeiroPedido:
		"O que você gostaria de fazer agora?\n" +
		"1. Adicionar outras luvas no pedido\n" +
		"2. Adicionar outros produtos no pedido -- INCOMPLETA\n" +
		"3. Quero ver meu carrinho ou fechar o meu pedido\n" +
		"4. Falar com um atendente",
	opcoes: {
		luvas: "Você escolheu comprar luvas.",
		produtos: "Você escolheu consultar outros produtos. Aqui está uma lista de produtos disponíveis...",
		notafiscal: "Você escolheu receber a sua Nota Fiscal. Por favor, forneça o número do seu pedido.",
		atendente: "Você escolheu falar com um atendente. Um momento, por favor.",
		invalida: "Opção inválida. Por favor, escolha uma das opções abaixo:"
	},

	atendente: {
		aguarde: "Um atendente irá falar com você em breve. Obrigado por sua paciência!",
	},

	erro: "Desculpe, algo deu errado. Por favor, digite !oi para começar novamente.",
	resetar: "ID inválido. Por favor, escolha um ID válido. Caso deseje recomeçar, digite !oi."
};

module.exports = mensagens;
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons, List, Poll } = require('whatsapp-web.js');
const client = new Client({
	authStrategy: new LocalAuth()
});
const mensagens = require('./mensagens');
const services = require('./service');


function simulaMensagem(from, body) {
	client.emit('message', {
		from: from,
		body: body,
		getChat: async function () {
			return { isGroup: false };
		}
	});
}


client.on('qr', qr => {
	qrcode.generate(qr, {
		small: true
	});
});

client.on('ready', () => {
	console.log('=== BOT EM FUNCIONAMENTO ===');
	simulaMensagem('31971638616@c.us', '!oi');
	simulaMensagem('31971638616@c.us', '1');
	simulaMensagem('31971638616@c.us', '1');
	simulaMensagem('31971638616@c.us', 'P');
	simulaMensagem('31971638616@c.us', '40');
	simulaMensagem('31971638616@c.us', '15');
	simulaMensagem('31971638616@c.us', 'sim');
	simulaMensagem('31971638616@c.us', '1'); // Adiciona mais luvas
	simulaMensagem('31971638616@c.us', '2');
	simulaMensagem('31971638616@c.us', 'PP');
	simulaMensagem('31971638616@c.us', 'M');
	simulaMensagem('31971638616@c.us', '5');
	simulaMensagem('31971638616@c.us', 'sim');
	simulaMensagem('31971638616@c.us', '3');
	simulaMensagem('31971638616@c.us', 'sim');
	simulaMensagem('31971638616@c.us', 'Avenida Marechal Castelo branco 265 JK');


});

const userState = {}; // Armazena o estado do usuário

client.on('message', async message => {
	let chat = await message.getChat();

	if (chat.isGroup) { return } // Não responde mensagens de grupos

	let contato = message.from;
	let userMessage = message.body.toLowerCase();

	if (!userState[contato]) {
		userState[contato] = { step: 0, carrinho: [] }; // Inicializa o estado do usuário
	}

	if (userMessage === "!reset") {
		userState[contato].step = 0;
		client.sendMessage(contato, "Estado resetado. Digite !oi para começar novamente.");
		return;
	}

	if (userMessage === "atendente") {
		userState[contato].step = 5;
		return;
	}

	console.log(`Mensagem recebida de ${contato}: ${userMessage}. Estado atual: ${userState[contato].step}`);

	// ESTADOS EXISTENTES
	switch (userState[contato].step) {
		// ESTADO 0: INÍCIO	
		case 0:
			if (userMessage === "!oi") {
				client.sendMessage(contato, mensagens.ola);
				client.sendMessage(contato, mensagens.opcoesIniciais);
				userState[contato].step = 1;
			}
			break;

		// ESTADO 1: ESCOLHA DE OPÇÕES
		case 1:
			services.trataOpcoesIniciais(userMessage, contato, client, userState);
			break;

		// ESTADO 2: COMPRA DE LUVAS
		case 2:
			services.trataSelecaoDeLuvas(userMessage, contato, client, userState);
			break;

		// ESTADO 3: CONSULTA DE PRODUTOS
		case 3:
			services.trataSelecaoDeProdutos(userMessage, contato, client, userState);
			break;

		// ESTADO 4: RECEBIMENTO DE NOTA FISCAL
		case 4:
			services.trataRecebimentoDeNotaFiscal(userMessage, contato, client, userState);
			break;

		// ESTADO 5: FALAR COM ATENDENTE
		case 5:
			client.sendMessage(contato, mensagens.atendente.aguarde);
			userState[contato].step = 0; // Resetar estado após finalizar o fluxo
			break;

		// ESTADO 6: ESCOLHA DE TAMANHO
		case 6:
			services.trataTamanhoEscolhido(userMessage, contato, client, userState);
			break;

		// ESTADO 7: QUANTIDADE ESCOLHIDA
		case 7:
			services.trataQuantidadeEscolhida(userMessage, contato, client, userState);
			break;

		// ESTADO 8: CONFIRMAÇÃO DE ITEM NO CARRINHO
		case 8:
			services.trataConfirmacaoDeItem(userMessage, contato, client, userState);
			break;

		// ESTADO 9: PRIMEIRO ITEM ADICIONADO AO CARRINHO
		case 9:
			services.trataAposPrimeiroItemAdicionado(userMessage, contato, client, userState);
			break;

		// ESTADO 10: FECHE O PEDIDO
		case 10:
			services.trataFechamentoDePedido(userMessage, contato, client, userState);
			break;

		// ESTADO 11: ENTREGA DO PEDIDO
		case 11:
			services.trataEntregaDePedido(userMessage, contato, client, userState);
			break;

		default:
			client.sendMessage(contato, mensagens.erro);
			userState[contato].step = 0; // Resetar estado em caso de erro
			break;
	}

});

client.initialize();
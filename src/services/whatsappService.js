const { Client, RemoteAuth, MessageMedia } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode');
const { executablePath } = require('puppeteer');

const mongoUri = process.env.MONGODB; // Defina a variável de ambiente MONGODB

// Conexão com o MongoDB

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
/*
mongoose.connect(mongoUri, clientOptions)
    .then(() => console.log('✅ Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));
*/   
let client;
let qrCodeBase64 = '';
let qrGerado = false; // Flag para indicar se o QR Code foi gerado

async function createClient() {
    // Aguarde a conexão do mongoose antes de criar o Client
    await mongoose.connect(mongoUri, clientOptions)
        .then(() => console.log('✅ Conectado ao MongoDB!'))
        .catch(err => console.error('Erro ao conectar ao MongoDB:', err));
    await mongoose.connection.db.admin().command({ ping: 1 });

    client = new Client({
        authStrategy: new RemoteAuth({
            store: new MongoStore({ mongoose: mongoose, session: 'lexwata' }),
            backupSyncIntervalMs: 300000 // 5 minutos
        }),
        puppeteer: { 
            headless: true,
            executablePath: require('puppeteer').executablePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-crash-reporter',
                '--disable-extensions',
                '--disable-in-process-stack-traces',
                '--disable-logging',
                '--disable-dev-profile',
                '--remote-debugging-port=9222'
            ]
        }
    });

    /*client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            executablePath: executablePath(),
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });*/

    client.on('qr', async qr => {
        console.log('Gerando QR Code Terminal!');
        qrcodeTerminal.generate(qr, { small: true });
        console.log('Escaneie este QR Code para conectar.');

        console.log('Gerando QR Code URL Base64!');
        try {
            const url = await qrcode.toDataURL(qr);
            qrCodeBase64 = url; // Armazena o QR Code como uma URL base64
            qrGerado = true;    // Marca que o QR Code foi gerado
            console.log('QR Code gerado como URL base64:', qrCodeBase64);
        } catch (err) {
            console.error('Erro ao gerar QR Code Base64:', err);
        }
    });

    client.on('ready', () => {
        qrGerado = false; // Reseta a flag de QR Code gerado
        console.log('✅ WhatsApp conectado!');
    });

    client.on('disconnected', reason => {
        console.log('⚠️ WhatsApp desconectado:', reason);
    });

    client.on('authenticated', () => {
        console.log('Cliente autenticado com sucesso!');

        /*setTimeout(() => {
            if (!client.info || !client.info.wid) {
                console.log("Tentando reconectar...");
                client.initialize();
            }
        }, 5000);*/
    });

    client.on('auth_failure', (msg) => {
        console.error('Falha na autenticação:', msg);
    });

    client.on('change_state', (state) => {
        console.log('Estado do cliente mudou para:', state);
    });

    client.on('error', (err) => {
        console.error('Erro no cliente WhatsApp:', err);
    });

    client.on('message', async msg => {
        if (msg.body === '!ping') {
            msg.reply('pong');
        }

        if (msg.type === 'order') {
            console.log(msg);

            let produtos = [];
            const order = await msg.getOrder();
            if (order.products) {
                order.products.forEach(product => {
                    produtos.push({
                        nome: product.name,
                        quantidade: product.quantity,
                        preco: product.price / 1000,
                        cupomfiscalItem: `${product.quantity} ${product.name} - ${product.price / 1000}`
                    });
                });
            } else {
                console.log('Nenhum produto encontrado no pedido.');
            }


            const pedido = {
                nome: msg._data.notifyName,
                telefone: msg.from.replace("@c.us", ""),
                quantidadeItens: msg._data.itemCount,
                orderId: msg.orderId,
                valorTotal: msg._data.totalAmount1000 / 1000,
                produtos: produtos,
                cupomFiscal: produtos.map(p => p.cupomfiscalItem),
                timestamp: msg.timestamp,
                deviceType: msg.deviceType
            };
            console.log('Pedido:', pedido);
        }
    });

    await client.initialize();
};

const isClientConnected = async () => {
    const state = await client.getState().catch(() => null);
    return state === 'CONNECTED';
};

exports.initialize = async () => {
    await createClient();
};

exports.sendImage = async (chatId, imageUrl, caption) => {
    if (!(await isClientConnected())) {
        throw new Error("Cliente do WhatsApp não conectado");
    }
    const media = await MessageMedia.fromUrl(imageUrl);
    return client.sendMessage(chatId, media, { caption });
};

exports.sendTextMessage = async (chatId, message) => {
    if (!(await isClientConnected())) {
        throw new Error("Cliente do WhatsApp não conectado");
    }
    return client.sendMessage(chatId, message);
};

exports.getQRCode = () => {
    if (qrGerado) {
        return qrCodeBase64;
    }
    return 'CONECTADO';
};

exports.getClientState = async () => {
    try {
        const state = await client.getState();
        console.log('Estado atual do cliente:', state);
        return state;
    } catch (err) {
        console.error('Erro ao obter o estado do cliente:', err);
        return 'DISCONNECTED';
    }
};

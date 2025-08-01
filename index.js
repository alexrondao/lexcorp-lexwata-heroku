const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const whatsappService = require('./src/services/whatsappService');
const messageRoutes = require('./src/routes/messageRoutes');
//const sessionStorageRoutes = require('./src/routes/sessionStorageRoutes');

const PORT = process.env.PORT || 3000;

(async () => {
    // Inicializar WhatsApp
    await whatsappService.initialize();
    
    // Rotas da API
    app.use('/message', messageRoutes);
    //app.use('/session', sessionStorageRoutes);

    // Rota para a homepage
    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lexwata API!</title>
                <link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Special Elite', cursive;
                        text-align: center;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f4f4f9;
                        color: #333;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 1.5rem;
                        max-width: 600px;
                        line-height: 1.6;
                    }
                    #qr-container {
                        margin-top: 30px;
                    }
                    #check-icon {
                        font-size: 4rem;
                        color: green;
                    }
                </style>
            </head>
            <body>
                <h1>Bem-vindo à Lexwata API!</h1>
                <p>Conecte-se ao futuro com nossa API poderosa e simples. Transforme ideias em realidade com facilidade e diversão!</p>
                <div id="qr-container">
                    <p>Carregando status do WhatsApp...</p>
                </div>

                <script>
                    async function loadStatus() {
                        try {
                            const res = await fetch('/message/status');
                            const data = await res.json();
                            const container = document.getElementById('qr-container');
                            container.innerHTML = '';
                            console.log('Client:', data);

                            if (data.connected) {
                                container.innerHTML = '<div id="check-icon">✅</div><p>WhatsApp conectado com sucesso!</p>';
                            } else {
                                const qrRes = await fetch('/message/qr');
                                const qrJson = await qrRes.json();
                                const qrBase64 = qrJson.qrCodeBase64 || '';
                                const img = document.createElement('img');

                                img.src = qrBase64;
                                img.alt = 'QR Code do WhatsApp';
                                img.style.width = '250px';
                                container.appendChild(img);
                                container.innerHTML += '<p>Escaneie o QR code acima para conectar ao WhatsApp.</p>';
                            }
                        } catch (error) {
                            document.getElementById('qr-container').innerHTML = '<p>Erro ao carregar status do WhatsApp.</p>';
                            console.log(error);
                        }
                    }

                    setInterval(loadStatus, 5000); // Atualiza a cada 5 segundos
                    loadStatus(); // Primeira chamada
                </script>
            </body>
            </html>
        `);
    });

    app.listen(PORT, '0.0.0.0', () => console.log(`API rodando na porta ${PORT}`));
})();

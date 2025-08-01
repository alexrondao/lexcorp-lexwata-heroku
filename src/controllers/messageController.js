const whatsappService = require('../services/whatsappService');

const validatePhoneNumber = (phone) => {
    // Valida se o número de telefone contém apenas dígitos e tem o tamanho esperado
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
};

exports.sendImage = async (req, res) => {
    const { to, imageUrl, caption } = req.body;

    // Validação dos campos
    if (!to || !imageUrl) {
        return res.status(400).json({ 
            success: false, 
            error: "Número de telefone e URL da imagem são obrigatórios." 
        });
    }

    // Detecta o tipo de destino com base no sufixo
    let destination = to;
    if (!to.endsWith('@g.us') && !to.endsWith('@newsletter')) {
        if (!validatePhoneNumber(to)) {
            return res.status(400).json({ 
                success: false, 
                error: "Número de telefone inválido." 
            });
        }
        destination = `${to}@c.us`; // Já está no formato correto
    }

    try {
        console.log("Destino detectado:", destination);

        //const response = await whatsappService.sendImage(`${to}@c.us`, imageUrl, caption);
        const response = await whatsappService.sendImage(destination, imageUrl, caption);
        res.status(200).json({ 
            success: true, 
            message: 'Imagem enviada com sucesso!', 
            data: response 
        });
    } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao enviar imagem', 
            details: error.message 
        });
    }
};

exports.sendText = async (req, res) => {
    const { to, message } = req.body;

    // Validação dos campos
    if (!to || !message) {
        return res.status(400).json({ 
            success: false, 
            error: "Número de telefone e mensagem são obrigatórios." 
        });
    }

    // Detecta o tipo de destino com base no sufixo
    let destination = to;
    if (!to.endsWith('@g.us') && !to.endsWith('@newsletter')) {
        if (!validatePhoneNumber(to)) {
            return res.status(400).json({ 
                success: false, 
                error: "Número de telefone inválido." 
            });
        }
        destination = `${to}@c.us`; // Já está no formato correto
    }

    try {
        console.log("Destino detectado:", destination);

        //await whatsappService.sendTextMessage(`${to}@c.us`, message);
        await whatsappService.sendTextMessage(destination, message);
        res.status(200).json({ 
            success: true, 
            message: "Mensagem enviada com sucesso!" 
        });
    } catch (error) {
        console.error("Erro ao enviar mensagem de texto:", error);
        res.status(500).json({ 
            success: false, 
            error: "Erro ao enviar mensagem de texto", 
            details: error.message 
        });
    }
};

exports.getQRCode = async (req, res) => {
    const qrCodeBase64 = whatsappService.getQRCode();

    if (qrCodeBase64 === 'CONECTADO') {
        return res.json({ qrCodeBase64: '' });
    } else {
        res.send({qrCodeBase64});
    }
};

exports.getClientState = async (req, res) => {
    const state = await whatsappService.getClientState();
    res.send({ "connected" : state === 'CONNECTED' });
};
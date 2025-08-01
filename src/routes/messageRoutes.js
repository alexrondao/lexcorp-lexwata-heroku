const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/image', messageController.sendImage);
router.post('/text', messageController.sendText); // Nova rota para mensagem de texto
router.get('/qr', messageController.getQRCode); // exibr o QR Code
router.get('/status', messageController.getClientState); // exibr o status do cliente

module.exports = router;

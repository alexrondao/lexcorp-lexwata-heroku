# LexWaTa - API de Integração com WhatsApp

LexWaTa é uma API que permite a integração com o WhatsApp através da conexão e autorização do WhatsApp do smartphone. Com esta API, você pode enviar mensagens de texto e imagens para usuários, grupos e canais do WhatsApp de forma programática.

A LexWaTa utiliza a biblioteca [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) para estabelecer a conexão com o WhatsApp Web e gerenciar as interações.

---

## 🚀 Funcionalidades

- Enviar mensagens de texto para usuários, grupos e canais.
- Enviar imagens com legendas para usuários, grupos e canais.
- Conexão segura utilizando autenticação local do WhatsApp Web.

---

## 🛠️ Como Usar

### 1. Pré-requisitos

- Node.js (versão 14 ou superior)
- Um smartphone com WhatsApp instalado e configurado
- Dependências do projeto instaladas (use `npm install`)

### 2. Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/lexwata.git
   cd lexwata
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Outras dependências:
    Instalação do Chromium Browser
    ```bash
    sudo apt install -y chromium-browser
    ```

    Bibliotecas de complemento do Chromium
    ```bash
    sudo apt update && sudo apt install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2
    ```

4. Configure as variáveis de ambiente no arquivo `.env`:
   ```env
   PORT=3000
   ```

5. Inicie a aplicação:
   ```bash
   npm start
   ```

6. Escaneie o QR Code exibido no terminal com o WhatsApp do seu smartphone para autenticar.

7. Comando Docker para subir o container da imagem publicada. Consulte o link abaixo se ainda não criou o seu Dockerfile
    ```link
    https://github.com/yaasiin-ayeva/wweb.js-docker/tree/main
    ```
    ```docker command
    docker run -d -p 8080:3000 -e PORT=3000 -e AZURE_STORAGE_CONNECTION_STRING="" ghcr.io/alexrondao/lexwata:latest
    ```
---

## 📖 Exemplos de Uso

### Enviar Mensagem de Texto

**Endpoint**: `POST /api/messages/send-text`

**Request**:
```json
{
    "to": "5511999999999@c.us",
    "message": "Olá, esta é uma mensagem de teste!"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Mensagem enviada com sucesso!"
}
```

---

### Enviar Imagem com Legenda

**Endpoint**: `POST /api/messages/send-image`

**Request**:
```json
{
    "to": "120363195813422840@g.us",
    "imageUrl": "https://example.com/image.jpg",
    "caption": "Esta é uma imagem de teste!"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Imagem enviada com sucesso!",
    "data": {
        "id": "true_1234567890@c.us_ABCDEF1234567890",
        "timestamp": 1678901234
    }
}
```

---

## 📂 Estrutura de Pastas

```plaintext
whatsapp-api/
│── src/
│   ├── controllers/
│   │   ├── messageController.js   # Lógica para envio de mensagens
│   ├── services/
│   │   ├── whatsappService.js     # Configuração do WhatsApp Web.js
│   ├── routes/
│   │   ├── messageRoutes.js       # Rotas da API
│   ├── config/
│   │   ├── server.js              # Configuração do Express
│   ├── index.js                   # Ponto de entrada da aplicação
│── node_modules/                   # Dependências do Node.js (criado automaticamente)
│── .env                             # Variáveis de ambiente (ex: porta, credenciais)
│── package.json                     # Configurações e dependências do projeto
│── README.md                        # Documentação do projeto
│── Dockerfile                       # Arquivo para deploy com Docker (opcional)
```

---

## 🧪 Testando a API

Você pode testar os endpoints da API utilizando ferramentas como [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/). Certifique-se de que a aplicação está em execução e use a URL base `http://localhost:3000`.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature ou correção: `git checkout -b minha-feature`.
3. Faça commit das suas alterações: `git commit -m 'Adiciona nova feature'`.
4. Envie para o repositório remoto: `git push origin minha-feature`.
5. Abra um Pull Request.

---

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 📞 Suporte

Se você tiver dúvidas ou problemas, entre em contato pelo e-mail `suporte@lexwata.com`.

---

## 🌟 Agradecimentos

Agradecemos à comunidade [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) por fornecer a base para este projeto.
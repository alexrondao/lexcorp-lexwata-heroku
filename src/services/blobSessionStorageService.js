const { BlobServiceClient } = require('@azure/storage-blob');
const { Readable } = require('stream');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'whatsapp-session';
const BLOB_NAME = 'session.json';

console.log(AZURE_STORAGE_CONNECTION_STRING);

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

async function saveSession(session) {
    const blockBlobClient = containerClient.getBlockBlobClient(BLOB_NAME);
    const data = JSON.stringify(session);
    const stream = Readable.from([data]);
    //await blockBlobClient.uploadStream(stream, data.length);
    await blockBlobClient.upload(data, Buffer.byteLength(data));
    console.log('✅ Sessão salva no Azure Blob');
}

async function loadSession() {
    const blockBlobClient = containerClient.getBlockBlobClient(BLOB_NAME);
    try {
        const downloadBlockBlobResponse = await blockBlobClient.download();
        const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
        return JSON.parse(downloaded.toString());
    } catch (err) {
        console.warn('⚠️ Sessão não encontrada no Blob:', err.message);
        return null;
    }
}

async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => chunks.push(data));
        readableStream.on('end', () => resolve(Buffer.concat(chunks)));
        readableStream.on('error', reject);
    });
}

module.exports = { saveSession, loadSession };

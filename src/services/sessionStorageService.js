const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const mime = require('mime-types');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'session-storage';

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('AZURE_BLOB_CONNECTION_STRING não está definida.');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

const AUTH_PATH = path.resolve('.wwebjs_auth');
const CACHE_PATH = path.resolve('.wwebjs_cache');

async function uploadFolder(folderPath, prefix) {
  const files = await getAllFiles(folderPath);

  for (const filePath of files) {
    try {
      // Verifica se o arquivo realmente existe e é um arquivo regular
      const stat = await fsp.stat(filePath);
      if (!stat.isFile()) {
        console.log(`⏭️ Ignorando: não é arquivo regular → ${filePath}`);
        continue;
      }

      const blobPath = path.join(prefix, path.relative(folderPath, filePath)).replace(/\\/g, '/');
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      const contentType = mime.lookup(filePath) || 'application/octet-stream';

      await blockBlobClient.uploadFile(filePath, {
        blobHTTPHeaders: { blobContentType: contentType }
      });

    } catch (error) {
      console.log(`❌ Erro ao enviar arquivo: ${filePath}`);
      console.log(`Detalhes: ${error.message}`);
    }
  }
}

async function downloadFolder(prefix, targetPath) {
  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    const blobClient = containerClient.getBlobClient(blob.name);
    const localFilePath = path.join(targetPath, path.relative(prefix, blob.name));

    await fsp.mkdir(path.dirname(localFilePath), { recursive: true });

    const downloadBlock = await blobClient.download();
    const buffer = await streamToBuffer(downloadBlock.readableStreamBody);

    await fsp.writeFile(localFilePath, buffer);
  }
}

async function folderExists(prefix) {
  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    return true;
  }
  return false;
}

async function getAllFiles(dirPath) {
  try {
    const entries = await fsp.readdir(dirPath, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const res = path.resolve(dirPath, entry.name);
      try {
        const stats = await fsp.stat(res);
        if (stats.isDirectory()) {
          return await getAllFiles(res);
        } else {
          return res;
        }
      } catch (e) {
        console.log(`❌ Ignorando item inválido: ${res}`);
        return []; // ignora paths inválidos
      }
    }));
    return files.flat();
  } catch (err) {
    console.log(`❌ Erro ao ler diretório: ${dirPath}`, err.message);
    return [];
  }
}

function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => chunks.push(data));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
}

async function uploadSessionFolders() {
  await uploadFolder(AUTH_PATH, 'auth');
  await uploadFolder(CACHE_PATH, 'cache');
}

async function downloadSessionFolders() {
  console.log('🔄 Baixando .wwebjs_auth do Blob...');
  await downloadFolder('auth', AUTH_PATH);

  console.log('🔄 Baixando .wwebjs_cache do Blob...');
  await downloadFolder('cache', CACHE_PATH);
  
  /*
  const hasAuth = await folderExists('auth');
  const hasCache = await folderExists('cache');

  if (hasAuth) {
    console.log('🔄 Baixando .wwebjs_auth do Blob...');
    await downloadFolder('auth', AUTH_PATH);
  } else {
    console.log('⚠️  Nenhum dado encontrado para .wwebjs_auth - o QR code será criado automaticamente, apos invoque o endpoint /upload para armazenar a sessao.');
  }

  if (hasCache) {
    console.log('🔄 Baixando .wwebjs_cache do Blob...');
    await downloadFolder('cache', CACHE_PATH);
  } else {
    console.log('⚠️  Nenhum dado encontrado para .wwebjs_cache - a sessao deve ser inicializada manualmente.');
  }*/
}

module.exports = {
  uploadSessionFolders,
  downloadSessionFolders,
  folderExists
};

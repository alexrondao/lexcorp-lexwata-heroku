const sessionStorageService = require('../services/sessionStorageService');

exports.upload = async (req, res) => {
  try {
    await sessionStorageService.uploadSessionFolders();
    res.status(200).json({ message: 'Sessão enviada com sucesso ao Azure Blob!' });
  } catch (error) {
    console.error('Erro no upload da sessão:', error);
    res.status(500).json({ error: 'Erro ao enviar sessão para o Blob.', details: error.message });
  }
};

exports.download = async (req, res) => {
  try {
    await sessionStorageService.downloadSessionFolders();
    res.status(200).json({ message: 'Sessão restaurada do Azure Blob com sucesso!' });
  } catch (error) {
    console.error('Erro no download da sessão:', error);
    res.status(500).json({ error: 'Erro ao baixar sessão do Blob.', details: error.message });
  }
};

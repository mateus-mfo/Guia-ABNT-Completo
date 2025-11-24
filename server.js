const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve files do diretório do projeto
app.use(express.static(__dirname));

// Serve os arquivos que já foram enviados para /mnt/data (opcional)
// Atenção: essa rota permite acessar arquivos do caminho local /mnt/data
// No seu ambiente Windows esse caminho existe porque o sistema upload gravou o arquivo lá.
app.use('/uploaded', express.static('/mnt/data'));

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`/uploaded -> mapeado para /mnt/data (use: /uploaded/data.json se quiser testar o arquivo já enviado)`);
});

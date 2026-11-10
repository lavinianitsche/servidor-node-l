const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');


const app = express();
const port = 3000;

// Use o cors
app.use(cors());

// Middleware para o Express enternder JSON no corpo da requisicao (req.body)
app.use(express.json());


// 1. Configura a conexao com o MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
    password: '',
    database: 'starlost'
});

// Conecta ao banco de dados
connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL: ', err.stack );
      return;
    }
    console.log('Conectado ao MySQL com sucesso!');

    // Cria a tabela 'alunos'  caso ela nao exista
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS alunos(
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      )`;
      connection.query( createTableQuery, (err) => {
          if (err) {
              console.error('Erro ao criar tabela: ', err.stack );
              return;
            }
        } );

    const createTableBagagemQuery = `
        CREATE TABLE IF NOT EXISTS itens_bagagem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_item VARCHAR(255) NOT NULL,
        clima VARCHAR(50),
        perfil VARCHAR(50),
        quantidade_por_dia INT DEFAULT 1
        )`;
    
        connection.query(createTableBagagemQuery, (err) => {
        if (err) {
        console.error('Erro ao criar tabela: ', err.stack);
        return;
        }
    });
});

app.get('/alunos', (req, res) => {
  connection.query('SELECT * FROM alunos', (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar alunos'});
    }
    res.json(results);
  });
});

app.get('/bagagem', (req, res) => {
  const { clima, perfil, duracao } = req.query;
  const dias = parseInt(duracao) || 1;

  const query = 'SELECT nome_item, quantidade_por_dia FROM itens_bagagem WHERE clima = ? OR perfil = ?';

  connection.query(query, [clima, perfil], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao gerar lista de bagagem' });
    }

    // Calcula a quantidade final com base nos dias de viagem
    const listaFinal = results.map(item => ({
      item: item.nome_item,
      quantidade: item.quantidade_por_dia * dias
    }));

    res.json(listaFinal);
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/`);
});

// -------------------------------------------------------------------

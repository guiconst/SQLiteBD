const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());

// Conexão com o banco de dados
const db = new sqlite3.Database('./meubanco.db', (err) => {
    if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
    console.log('Conectado ao banco de dados SQLite');
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
        )
    `, (err) => {
        if (err) {
        console.error('Erro ao criar tabela:', err.message);
        } else {
        console.log('Tabela de usuários pronta');
        }
    });
    }
});

// CREATE
app.post('/usuarios', (req, res) => {
    const { nome, email } = req.body;
    if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const sql = 'INSERT INTO usuarios (nome, email) VALUES (?, ?)';
    db.run(sql, [nome, email], function (err) {
    if (err) {
        return res.status(500).json({ error: 'Erro ao inserir usuário ou email já existe' });
    }
    res.status(201).json({
        message: 'Usuário criado com sucesso!',
        id: this.lastID
    });
    });
});

// READ - todos os usuários
app.get('/usuarios', (req, res) => {
  const sql = 'SELECT * FROM usuarios';
    db.all(sql, [], (err, rows) => {
    if (err) {
        return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    res.json({
        message: 'Usuários listados com sucesso!',
        data: rows
    });
    });
});

// READ - usuário por ID
app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    db.get(sql, [id], (err, row) => {
    if (err) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
    if (row) {
        res.json({
        message: 'Usuário encontrado!',
        data: row
        });
    } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
    }
    });
});

// UPDATE
app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;

    if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const sql = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
    db.run(sql, [nome, email, id], function (err) {
    if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
    if (this.changes > 0) {
        res.json({ message: 'Usuário atualizado com sucesso' });
    } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
    }
    });
});

// DELETE
app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    db.run(sql, [id], function (err) {
    if (err) {
        return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
    if (this.changes > 0) {
        res.json({ message: `Usuário com ID ${id} deletado com sucesso` });
    } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
    }
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Fecha a conexão com o banco ao encerrar o processo
process.on('SIGINT', () => {
    db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conexão com o banco de dados SQLite fechada');
    process.exit(0);
    });
});
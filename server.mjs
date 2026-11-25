import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./hotel.db');

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS pensoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    valorAdicional REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS categoria_uh (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tarifas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    valorBaseDiaria REAL NOT NULL,
    idPensaoPadrao INTEGER NOT NULL,
    FOREIGN KEY (idPensaoPadrao) REFERENCES pensoes(id)
  );

  CREATE TABLE IF NOT EXISTS uhs (
    numeroUH TEXT PRIMARY KEY,
    categoria INTEGER NOT NULL,
    capacidadeMaxima INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'LIVRE',
    qtdePessoas INTEGER NOT NULL DEFAULT 0,
    idTarifa INTEGER NOT NULL,
    FOREIGN KEY (categoria) REFERENCES categoria_uh(id),
    FOREIGN KEY (idTarifa) REFERENCES tarifas(id)
  );

  CREATE TABLE IF NOT EXISTS hospedes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numeroUH TEXT NOT NULL,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    idPensao INTEGER NOT NULL,
    titular INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (numeroUH) REFERENCES uhs(numeroUH) ON DELETE CASCADE,
    FOREIGN KEY (idPensao) REFERENCES pensoes(id)
  );

  CREATE TABLE IF NOT EXISTS lancamentos_caixa( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    numeroUH TEXT NOT NULL, 
    nomeTitular TEXT NOT NULL, 
    qtdeDiarias INTEGER NOT NULL, 
    qtdePessoas  INTEGER NOT NULL,
    valorTotal REAL NOT NULL, 
    formaPagamento TEXT NOT NULL,
    dataHora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (numeroUH) REFERENCES uhs(numeroUH)
  );
`);

const totalPensoes = db.prepare('SELECT COUNT(*) as total FROM pensoes').get().total;
if (totalPensoes === 0) {
  db.exec(`
    INSERT INTO pensoes (codigo, descricao, valorAdicional) VALUES
      ('CAFE', 'Café da Manhã', 0),
      ('MAP', 'Meia Pensão (Café + Jantar)', 85.00),
      ('FAP', 'Pensão Completa (3 Refeições)', 150.00);

    INSERT INTO tarifas (descricao, valorBaseDiaria, idPensaoPadrao) VALUES
      ('Tarifa Balcão Standard', 320.00, 1),
      ('Tarifa Família Resort', 580.00, 2),
      ('Tarifa Chalé Premium', 890.00, 3);

    INSERT INTO categoria_uh (codigo, descricao) VALUES
      ('STD', 'Standard'),
      ('FML', 'Família'),
      ('CHL', 'Chalé');

    INSERT INTO uhs (numeroUH, categoria, capacidadeMaxima, status, qtdePessoas, idTarifa) VALUES
      ('101', 1, 2, 'LIVRE', 0, 1),
      ('205', 2, 4, 'OCUPADA', 2, 2),
      ('302', 3, 6, 'MANUTENCAO', 0, 3);

    INSERT INTO hospedes (numeroUH, nome, cpf, idPensao, titular) VALUES
      ('205', 'Carlos Eduardo', '11122233344', 2, 1),
      ('205', 'Ana Paula', '55566677788', 2, 0);
  `);
}

function lerBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
  });
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    if (req.method === 'GET' && req.url === '/pensoes') {
      const lista = db.prepare('SELECT * FROM pensoes ORDER BY id').all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(lista));
    }

    if (req.method === 'POST' && req.url === '/pensoes') {
      const { codigo, descricao, valorAdicional } = await lerBody(req);
      const result = db
        .prepare('INSERT INTO pensoes (codigo, descricao, valorAdicional) VALUES (?, ?, ?)')
        .run(codigo.toUpperCase(), descricao, Number(valorAdicional));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ id: result.lastInsertRowid }));
    }

    if (req.method === 'GET' && req.url === '/tarifas') {
      const lista = db
        .prepare(`
          SELECT t.*, p.codigo as codigoPensao, p.descricao as descricaoPensao
          FROM tarifas t
          INNER JOIN pensoes p ON p.id = t.idPensaoPadrao
          ORDER BY t.id
        `)
        .all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(lista));
    }

    if (req.method === 'GET' && req.url === '/categorias_uh') {
      const lista = db.prepare('SELECT * FROM categoria_uh ORDER BY id').all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(lista));
    }

    if (req.method === 'POST' && req.url === '/categorias_uh') {
      const { codigo, descricao } = await lerBody(req);
      const result = db
        .prepare('INSERT INTO categoria_uh (codigo, descricao) VALUES (?, ?)')
        .run(codigo.toUpperCase(), descricao);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ id: result.lastInsertRowid }));
    }

    if (req.method === 'POST' && req.url === '/tarifas') {
      const { descricao, valorBaseDiaria, idPensaoPadrao } = await lerBody(req);
      const result = db
        .prepare('INSERT INTO tarifas (descricao, valorBaseDiaria, idPensaoPadrao) VALUES (?, ?, ?)')
        .run(descricao, Number(valorBaseDiaria), Number(idPensaoPadrao));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ id: result.lastInsertRowid }));
    }

    if (req.method === 'GET' && req.url === '/uhs') {
      const uhs = db
        .prepare(`
          SELECT u.*, t.descricao as descricaoTarifa, t.valorBaseDiaria, t.idPensaoPadrao,
                 c.codigo as codigoCategoria, c.descricao as descricaoCategoria
          FROM uhs u
          INNER JOIN tarifas t ON t.id = u.idTarifa
          LEFT JOIN categoria_uh c ON c.id = u.categoria
          ORDER BY u.numeroUH
        `)
        .all();

      const stmtHospedes = db.prepare(`
        SELECT h.id, h.numeroUH, h.nome, h.cpf, h.idPensao, h.titular,
               p.codigo as codigoPensao, p.valorAdicional
        FROM hospedes h
        INNER JOIN pensoes p ON p.id = h.idPensao
        WHERE h.numeroUH = ?
      `);

      const resultado = uhs.map((u) => {
        const hospedes = stmtHospedes.all(u.numeroUH).map((h) => ({
          ...h,
          titular: Boolean(h.titular),
        }));
        const adicionalPensoes = hospedes.reduce((acc, h) => acc + Number(h.valorAdicional), 0);
        return {
          ...u,
          valorDiariaTotal: Number(u.valorBaseDiaria) + adicionalPensoes,
          hospedes,
        };
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(resultado));
    }

    if (req.method === 'POST' && req.url === '/uhs') {
      const { numeroUH, categoria, capacidadeMaxima, idTarifa } = await lerBody(req);
      db.prepare(
        `INSERT INTO uhs (numeroUH, categoria, capacidadeMaxima, status, qtdePessoas, idTarifa)
         VALUES (?, ?, ?, 'LIVRE', 0, ?)`
      ).run(numeroUH, Number(categoria), Number(capacidadeMaxima), Number(idTarifa));

      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (
      req.method === 'POST' &&
      req.url?.startsWith('/uhs/') &&
      req.url?.endsWith('/checkout')
    ) {
      const numeroUH = decodeURIComponent(req.url.split('/')[2]);
      const { qtdeDiarias, formaPagamento, valorTotal } = await lerBody(req);

      const uh = db
        .prepare(
          `
          SELECT u.status,
                 u.qtdePessoas,
                 MAX(t.valorBaseDiaria) as valorBaseDiaria,
                 COALESCE(SUM(p.valorAdicional), 0) as valorPensoes,
                 MAX(CASE WHEN h.titular = 1 THEN h.nome END) as nomeTitular
          FROM uhs u
          INNER JOIN tarifas t ON t.id = u.idTarifa
          LEFT JOIN hospedes h ON h.numeroUH = u.numeroUH
          LEFT JOIN pensoes p ON p.id = h.idPensao
          WHERE u.numeroUH = ?
          GROUP BY u.numeroUH, u.status, u.qtdePessoas
        `
        )
        .get(numeroUH);

      if (!uh) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, message: 'UH não encontrada.' }));
      }

      if (uh.status !== 'OCUPADA') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({ ok: false, message: `UH ${numeroUH} não está ocupada (${uh.status}).` })
        );
      }

      if (!uh.nomeTitular) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({ ok: false, message: 'Nenhum titular encontrado para esta UH.' })
        );
      }

      const diarias = Number(qtdeDiarias);
      const totalCalculado =
        valorTotal !== undefined
          ? Number(valorTotal)
          : diarias * (Number(uh.valorBaseDiaria) + Number(uh.valorPensoes));

      db.exec('BEGIN TRANSACTION');
      try {
        const result = db
          .prepare(
            `INSERT INTO lancamentos_caixa (numeroUH, nomeTitular, qtdeDiarias, qtdePessoas, valorTotal, formaPagamento)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .run(
            numeroUH,
            uh.nomeTitular,
            diarias,
            Number(uh.qtdePessoas),
            totalCalculado,
            formaPagamento
          );

        db.prepare('DELETE FROM hospedes WHERE numeroUH = ?').run(numeroUH);
        db.prepare("UPDATE uhs SET status = 'LIVRE', qtdePessoas = 0 WHERE numeroUH = ?").run(
          numeroUH
        );

        db.exec('COMMIT');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, id: result.lastInsertRowid }));
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    }

    if (req.method === 'GET' && req.url === '/caixa') {
      const caixa = 
        db.prepare('SELECT * FROM lancamentos_caixa order by dataHora DESC, id DESC')
        .all();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(caixa));
    }

    if (req.method === 'PATCH' && req.url?.startsWith('/uhs/')) {
      const numeroUH = req.url.split('/')[2];
      const payload = await lerBody(req);

      db.exec('BEGIN TRANSACTION');
      try {
        if (payload.status === 'LIVRE' || payload.status === 'MANUTENCAO') {
          db.prepare('DELETE FROM hospedes WHERE numeroUH = ?').run(numeroUH);
          db.prepare('UPDATE uhs SET status = ?, qtdePessoas = 0 WHERE numeroUH = ?').run(
            payload.status,
            numeroUH
          );
        } else if (Array.isArray(payload.hospedes)) {
          db.prepare('DELETE FROM hospedes WHERE numeroUH = ?').run(numeroUH);
          const insertHospede = db.prepare(
            'INSERT INTO hospedes (numeroUH, nome, cpf, idPensao, titular) VALUES (?, ?, ?, ?, ?)'
          );

          for (const h of payload.hospedes) {
            insertHospede.run(numeroUH, h.nome, h.cpf, Number(h.idPensao), h.titular ? 1 : 0);
          }

          db.prepare('UPDATE uhs SET status = ?, qtdePessoas = ? WHERE numeroUH = ?').run(
            payload.status ?? 'OCUPADA',
            payload.hospedes.length,
            numeroUH
          );
        }
        db.exec('COMMIT');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    }

    res.writeHead(404);
    res.end();
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));
  }
});

server.listen(3333, () => {
  console.log('Servidor SQLite (hotel.db) rodando em http://localhost:3333');
});
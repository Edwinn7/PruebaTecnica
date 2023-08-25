const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testdb'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/analizarCompras', (req, res) => {
    res.sendFile(__dirname + '/analizarCompras.html');
});
// Ruta para manejar el envío del formulario
app.post('/agregarCliente', (req, res) => {
    const { Cedula, Nombres, Apellidos, Direccion, FechaNacimiento, Genero, Celular, Email } = req.body;

    const query = 'INSERT INTO CLIENTES (Cedula, Nombres, Apellidos, Direccion, FechaNacimiento, Genero, Celular, Email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Cedula, Nombres, Apellidos, Direccion, FechaNacimiento, Genero, Celular, Email];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al insertar el cliente:', err);
            res.status(500).json({ error: 'Error al insertar el cliente en la base de datos' });
        } else {
            console.log('Cliente insertado correctamente');
            res.json({ message: 'Cliente insertado correctamente' });
        }
    });
});
const fs = require('fs');

app.post('/modificarVentas', (req, res) => {
    const ventasFile = req.body.ventasFile;

    if (!ventasFile) {
        res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        return;
    }
    fs.readFile(ventasFile.path, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo' });
            return;
        }
        res.json({ message: 'Ventas modificadas exitosamente según el archivo' });
    });
});


app.get('/realizarAnalisis', (req, res) => {
    const query = `
      SELECT c.Cedula, c.Nombres, c.Apellidos, v.Modelo, COUNT(*) AS CantidadCompras
      FROM CLIENTES c
      JOIN VENTAS ve ON c.Cedula = ve.ClienteCedula
      JOIN VEHICULOS v ON ve.NumeroMotor = v.NumeroMotor
      GROUP BY c.Cedula, c.Nombres, c.Apellidos, v.Modelo
      HAVING CantidadCompras > 2;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al analizar compras:', err);
            res.status(500).json({ error: 'Error al analizar compras en la base de datos' });
        } else {
            const analysisResults = results.map(row => {
                const cedula = row.Cedula;

                const dateQuery = `
                  SELECT Fecha
                  FROM CLIENTES c
                  JOIN VENTAS ve ON c.Cedula = ve.ClienteCedula
                  WHERE c.Cedula = ?;
                `;

                db.query(dateQuery, [cedula], (dateErr, dateResults) => {
                    if (dateErr) {
                        console.error('Error al obtener fechas de compra:', dateErr);
                    } else {
                        if (dateResults.length > 1) {
                            const dates = dateResults.map(dateRow => dateRow.Fecha);
                            const timeDifferences = [];

                            // Calcular las diferencias de tiempo entre las fechas de compra
                            for (let i = 1; i < dates.length; i++) {
                                const diffInDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
                                timeDifferences.push(diffInDays);
                            }

                            const totalDays = timeDifferences.reduce((total, diff) => total + diff, 0);

                            const averagePeriodicity = totalDays / (dates.length - 1);

                            const today = new Date();
                            const nextPurchaseDate = new Date(today.getTime() + averagePeriodicity * 24 * 60 * 60 * 1000);

                            row.PeriodicidadPromedio = averagePeriodicity;
                            row.ProximaCompra = nextPurchaseDate.toISOString().slice(0, 10);
                        }
                    }
                });

                return row;
            });

            res.json({ analysis: analysisResults });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

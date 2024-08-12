// index.js
import express from 'express';
import cors from 'cors';
import { Preference, MercadoPagoConfig } from 'mercadopago';

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: 'TEST-1751196666639881-111119-2b11db3b01f636591b691cf815c49c03__LC_LD__-69328663',
});

const app = express();
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

app.post('/create_preference', async (req, res) => {
  try {
    const preferenceData = {
      items: [
        {
          title: req.body.title,
          quantity: req.body.quantity,
          currency_id: 'ARS',
          unit_price: req.body.unit_price,
        },
      ],
    };

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    console.log('Respuesta de MercadoPago:', response);

    if (response && response.id) {
      res.json({ id: response.id });
    } else {
      console.error('Error: La respuesta de la API no contiene un ID de preferencia.');
      res.status(500).json({ error: 'No se pudo crear la preferencia de pago.' });
    }
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

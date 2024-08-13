// index.js
import express from 'express';
import cors from 'cors';
import { Preference, MercadoPagoConfig } from 'mercadopago';

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-933414536358441-081222-bee3abe7ddd594e53037852fe412cbfc-26063835',
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
      back_urls: {
        success: 'http://localhost:5500/confirmation.html',  // Redirige aquí si el pago es exitoso
        failure: 'http://localhost:5500/failed.html',        // Redirige aquí si el pago falla
        pending: 'http://localhost:5500/pending.html'        // Redirige aquí si el pago está pendiente
      },
      auto_return: 'approved'
    };

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    console.log('Respuesta de MercadoPago:', response);

    if (response && response.id) {
      res.json({ id: response.id, paymentId: response.collector_id });
    } else {
      console.error('Error: La respuesta de la API no contiene un ID de preferencia.');
      res.status(500).json({ error: 'No se pudo crear la preferencia de pago.' });
    }
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


app.get('/webhook', (req, res) => {
  const payment = req.query.payment_id;

  if (payment) {
    const paymentId = payment;

    fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer APP_USR-933414536358441-081222-bee3abe7ddd594e53037852fe412cbfc-26063835`
      }
    })
    .then(response => response.json())
    .then(paymentInfo => {
      if (paymentInfo.status === 'approved') {
        console.log('Pago aprobado:', paymentInfo);
        // Aquí puedes actualizar el estado del pedido en la base de datos
      }
    })
    .catch(error => console.error('Error obteniendo detalles del pago:', error));
  }

  res.status(200).send('OK');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

const config = require('config');
const STRIPE_SK_KEY = config.get('STRIPE_SK_KEY');
// const stripe = require('stripe')(STRIPE_SK_KEY);
const express = require('express');
const app = express();

// const YOUR_DOMAIN = 'http://localhost:4242';

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/test', (req, res) => {
	res.json({message: "Hello World!"});
});

// app.post('/create-checkout-session', async (req, res) => {
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
//         price: '{{PRICE_ID}}',
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     success_url: `${YOUR_DOMAIN}?success=true`,
//     cancel_url: `${YOUR_DOMAIN}?canceled=true`,
//   });

//   res.redirect(303, session.url);
// });

app.listen(4242, () => console.log('Running on port 4242'));
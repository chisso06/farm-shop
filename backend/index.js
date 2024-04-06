const config = require('config');
const STRIPE_SK_KEY = config.get('STRIPE_SK_KEY');
const stripe = require('stripe')(STRIPE_SK_KEY);
const express = require('express');
const app = express();

app.use(express.json())

const YOUR_DOMAIN = 'http://localhost:3000';

var	session_id = '';

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/test', (req, res) => {
	res.json({ message: "Hello World!" });
});

app.post('/order-process', async (req, res, next) => {
	const data = req.body;
	console.log("[backend]order-process");
	console.log("checkout_session_id: " + data.checkout_session_id);
	const session = await stripe.checkout.sessions.retrieve(data.checkout_session_id);
	console.log(session.status);
	if (session.status === 'complete') {
		// カートを削除
		// 注文番号を発行
		// データベースに保存
		// メール送信
		return res.json({order_id: '0000000000'});
	}
});

app.post('/create-checkout-session', async (req, res) => {
	const price = 6000; // リクエストとしてsession_idを受け取り、カートのデータベースから金額を取得する
	const session = await stripe.checkout.sessions.create({
		billing_address_collection: 'required',
		shipping_address_collection: {
			allowed_countries: ['JP'],
		},
		phone_number_collection: {
			enabled: true,
		},
		line_items: [
			{
				price_data: {
					currency: 'jpy',
					product_data: {
						name: "ひだまり農園 オンラインショッピング"
					},
					unit_amount: price
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		// success_url: `${YOUR_DOMAIN}:4242/checkout-result?status=success&id={CHECKOUT_SESSION_ID}`,
		success_url: `${YOUR_DOMAIN}/order-processing?checkout_session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${YOUR_DOMAIN}/cart`,
	});
	res.redirect(303, `${session.url}`);
});

app.listen(4242, () => console.log('Running on port 4242'));
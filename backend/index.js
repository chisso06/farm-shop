// config
const config = require('config');
const FRONTEND_ORIGIN = config.get('FRONTEND_ORIGIN');

// // cors
// const origin = req.headers.origin;
// if (origin === FRONTEND_ORIGIN) {
//   res.header('Access-Control-Allow-Origin', origin);
//   res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//   // res.header('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
// }

//stripe
const STRIPE_SK_KEY = config.get('STRIPE_SK_KEY');
const stripe = require('stripe')(STRIPE_SK_KEY);

// mysql2
const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'miyu',
	password: '',
	database: 'farm_shop'
})

// cors
const cors = require('cors');

// express
const express = require('express');
const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
	console.log(`[${req.method}] ${req.url}`);
	next();
})

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/test', (req, res) => {
	res.json({ message: "Hello World!" });
});

app.get('/products', (req, res) => {
	console.log('[backend] products');

	const sql_prompt = `
		SELECT ${req.query.col ? req.query.col : '*'}
		FROM products
		${req.query.condition ? `WHERE ${req.query.condition}` : ''}
		`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
        console.log('connection error');
        throw err;
      }
			console.log(results);
			res.json(results);
    }
  );
});

app.get('/product/:id', (req, res) => {
  connection.query(
    `SELECT * FROM products WHERE id=${req.params.id}`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json(results[0]);
		}
  );
});

app.post('/order-process', async (req, res, next) => {
	const data = req.body;
	console.log("[backend]order-process");
	console.log("checkout_session_id: " + data.checkout_session_id);
	const session = await stripe.checkout.sessions.retrieve(data.checkout_session_id);
	console.log(session.status);
	if (session.status === 'complete') {
    console.log("[checkout completed]");
		// カートを削除
		// 注文番号を発行
		// データベースに保存
		// メール送信
		return res.json({status: session.status, order_id: '0000000000'});
	} else {
    console.log("[checkout canceled]");
    return res.json({status: session.status});
  }
});

app.post('/create-checkout-session', async (req, res) => {
	const price = 6000; // フロントからcookieを受け取り、カートのデータベースから金額を取得する
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
		success_url: `${FRONTEND_ORIGIN}/order-processing?checkout_session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${FRONTEND_ORIGIN}/order-processing?checkout_session_id={CHECKOUT_SESSION_ID}`,
	});
	res.redirect(303, `${session.url}`);
});

app.all("*", (req, res) => {
	console.log('[backend]404 ');
  res.send("404!")
})

app.listen(4242, () => console.log('Running on port 4242'));
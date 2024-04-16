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
const mysqlPromise = require('mysql2/promise');

// cors
const cors = require('cors');

// crypto
const crypto = require('crypto');

// express
const express = require('express');
const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
	console.log(`[${req.method}] ${req.url}`);
	next();
});
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/test', (req, res) => {
	res.json({ message: "Hello World!" });
});

app.get('/products', (req, res) => {
	const sql_prompt = `
		SELECT products.*, images.id AS image_id
		FROM products
		INNER JOIN images ON products.id=product_id
		WHERE
			${req.query.category ? `category='${req.query.category}' AND` : ''}
			${req.query.popular_status ? `popular_status=${req.query.popular_status} AND`: ''}
			order_of_images=1
		`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
        console.log('connection error');
        throw err;
      }
			res.json(results);
    }
  );
});

app.get('/products/:id', (req, res) => {
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

app.get('/products/:id/images', (req, res) => {
	const sql_prompt = `
		SELECT * FROM images WHERE product_id=${req.params.id} ORDER BY order_of_images
	`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
        console.log('connection error');
        throw err;
      }
			res.json(results);
    }
  );
});

app.get('/news', (req, res) => {
	connection.query(`
		SELECT id, DATE_FORMAT(date, '%Y年%m月%d日') AS date, content
		FROM news ORDER BY date desc`,
	(err, results, fields) => {
		if (err) {
			console.log('connection error');
			throw err;
		}
		res.json(results);
	});
});

app.get('/shipping/:id', (req, res) => {
	connection.query(`
		SELECT
			method_id,
			name,
			size,
			min_n, max_n,
			Hokkaido, Tohoku, Kanto, Sinetsu, Hokuriku, Tokai, Kinki, Chugoku, Shikoku, Kyusyu, Okinawa
		FROM shipping_methods
		INNER JOIN shipping_fees ON shipping_methods.id=shipping_fees.method_id
		WHERE method_id=${req.params.id}
		ORDER BY min_n`,
	(err, results, fields) => {
		if (err) {
			console.log('connection error');
			throw err;
		}
		res.json(results);
	});
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
	const orderId = req.body.order_id;
	const cart = JSON.parse(req.body.cart);
	const customer = JSON.parse(req.body.customer);
	const connectionPromise = await mysqlPromise.createConnection({
		host: 'localhost',
		user: 'miyu',
		password: '',
		database: 'farm_shop',
		// namedPlaceholders: true
	});
	const line_items = [];
	const shippingMethods = [];
	const areaList = [
		{method_name: 'Hokkaido', name: '北海道', prefectures: ['北海道']},
		{method_name: 'Hokkaido', name: '東北', prefectures: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県']},
		{method_name: 'Hokkaido', name: '関東', prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '山梨県']},
		{method_name: 'Hokkaido', name: '信越', prefectures: ['新潟県', '長野県']},
		{method_name: 'Hokkaido', name: '北陸', prefectures: ['富山県', '石川県', '福井県']},
		{method_name: 'Hokkaido', name: '東海', prefectures: ['岐阜県', '静岡県', '愛知県', '三重県']},
		{method_name: 'Hokkaido', name: '近畿', prefectures: ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県']},
		{method_name: 'Hokkaido', name: '中国', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県']},
		{method_name: 'Hokkaido', name: '四国', prefectures: ['徳島県', '香川県', '愛媛県', '高知県']},
		{method_name: 'Hokkaido', name: '九州', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県']},
		{method_name: 'Hokkaido', name: '沖縄', prefectures: ['沖縄県']},
	];
	var total_amount = 0;
	var shipping_fee = 0;

	console.log('orderId: ', orderId);

	// 同一のorderIdで、未完了の支払いがあるかどうかをチェック
	await connectionPromise.beginTransaction();
	const [results] = await connectionPromise.query(
		`SELECT * FROM orders WHERE id='${orderId}' AND status='pending-payment'`
	).catch((err) => {
		console.log('connection error');
		throw err;
	});
	if (results.length) {
		const session = await stripe.checkout.sessions.retrieve(results[0].checkout_session_id)
		.catch((err) => {throw err;});
		console.log('session_url:', session.url);
		if (session.url) {
			return res.redirect(303, session.url);
		} else {
			throw new Error('Error!');
		}
	}

	// 在庫確認
	var stock_status = 1;
	await Promise.all(cart.map(async (item, i) => {
		// 在庫確認・更新
		if (stock_status) {
			await connectionPromise.beginTransaction();
			const [stock_results] = await connectionPromise.query(
				`SELECT stock FROM products WHERE id=${item.product_id}`
			).catch((err) => {
				console.log('connection error');
				throw err;
			});
			const stock = stock_results[0].stock;
			item['stock'] = stock;
			if (stock < 0 || stock < item.number)
				stock_status = 0;
		}
	}));
	if (!stock_status) {
		return res.redirect(`${FRONTEND_ORIGIN}/cart?message=商品の在庫がありません`);
	}

	// line_itemsの作成、shippingMethods(配送方法の種類と数)の作成、合計額の計算
	await Promise.all(cart.map(async (item, i) => {
		// 在庫更新
		connection.query(`
			UPDATE products SET stock=${item.stock - item.number} WHERE id=${item.product_id}`,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
			}
		);

		// line_item
		await connectionPromise.beginTransaction();
		const [results] = await connectionPromise.query(
			`SELECT name, price FROM products WHERE id=${item.product_id}`
		).catch((err) => {
			console.log('connection error');
			throw err;
		});
		const line_item = {
			price_data: {
				currency: 'jpy',
				product_data: {
					name: results[0].name
				},
				unit_amount: results[0].price
			},
			quantity: item.number,
		};
		line_items.push(line_item);

		// shipping_method
		const s_i = shippingMethods.findIndex(
			({method_id}) => method_id === item.shipping_method);
		if (s_i < 0)
			shippingMethods.push({method_id: item.shipping_method, number: item.number});
		else
			shippingMethods[s_i].number += item.number;

		// calculate total amount
		total_amount += results[0].price * item.number;
	}));

	// 送料計算
	await Promise.all(shippingMethods.map(async (method) => {
		await connectionPromise.beginTransaction();
		const [results] = await connectionPromise.query(`
			SELECT
				method_id,
				name,
				size,
				min_n, max_n,
				Hokkaido, Tohoku, Kanto, Sinetsu, Hokuriku, Tokai, Kinki, Chugoku, Shikoku, Kyusyu, Okinawa
			FROM shipping_methods
			INNER JOIN shipping_fees ON shipping_methods.id=shipping_fees.method_id
			WHERE method_id=${method.method_id}
			ORDER BY min_n`
			).catch((err) => {
				console.log('connection error');
				throw err;
			}
		);
		var i = 0;
		while (i < results.length - 1 && (method.number < results[i].min_n || results[i].max_n < method.number))
			i ++;
		const area = areaList.find((area) => area.prefectures.find((p) => p === customer.prefecture));
		shipping_fee += results[i][area.method_name];
	}));

	line_items.push({
		price_data: {
			currency: 'jpy',
			product_data: {
				name: '送料'
			},
			unit_amount: shipping_fee
		},
		quantity: 1,
	});

	const session = await stripe.checkout.sessions.create({
		client_reference_id: orderId,
		customer_email: customer.email,
		line_items,
		mode: 'payment',
		expires_at: Math.trunc(Date.now() / 1000 + 30 * 60),
		success_url: `${FRONTEND_ORIGIN}/order-completed?order_id=${orderId}`,
		cancel_url: `${FRONTEND_ORIGIN}/cart`,
	}).catch((err) => {
		console.log('[stripe]');
		console.log('error message: ', err.raw.message);
		console.log('error param: ', err.raw.param);
		throw (err);
	});

	// order database
	var sql_prompt = `
		INSERT INTO orders (
			id, checkout_session_id, shipping_fee, total_amount, customer
		) VALUES (
			'${orderId}',
			'${session.id}',
			${shipping_fee},
			${total_amount},
			'${JSON.stringify(customer)}'
		)`;
	connection.query(
		sql_prompt,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
		});
	// ordered_products database
	cart.map((item) => {
		sql_prompt = `
		INSERT INTO ordered_products (
			order_id, product_id, name, price, number
		) VALUES (
			'${orderId}',
			${item.product_id},
			'${item.name}',
			${item.price},
			${item.number}
		)`;
		connection.query(
			sql_prompt,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
			});
	})
	res.redirect(303, session.url);
});

app.all("*", (req, res) => {
	console.log('[backend]404 ');
  res.send("404!");
})

app.listen(4242, () => console.log('Running on port 4242'));

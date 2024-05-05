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

// fs
const fs = require('fs');

// multer
const multer  = require('multer');

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
	res.json({ status: 'success', message: "Hello World!" });
});

const productsStorage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'backend/public/products'),
	filename: (req, file, cb) => {cb(null, file.originalname)}
});
const uploadProducts = multer({ storage: productsStorage });
app.post('/upload/products', uploadProducts.array('files[]', 10), (req, res) => {
	console.log('body:', req.body);
	console.log('files:', req.files);
	res.json({status: 'success'});
});

app.get('/products', (req, res) => {
	const category = req.query.category;
	const popular_status = Number(req.query.popular_status);
	const sql_prompt = `
		SELECT products.*, images.id AS image_id
		FROM products
		LEFT JOIN images ON products.id=product_id
		WHERE
			${category ? `category='${category}' AND` : ''}
			${popular_status ? `popular_status=1 AND`: ''}
			(images.id IS NULL OR order_of_images=1)
		`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
        console.log('connection error');
        throw err;
      }
			results.map((p) => {
				if (!p.image_id)
					p.image_id = 0;
			})
			res.json(results);
    }
  );
});

// app.get('/products/images', (req, res) => {
// 	const sql_prompt = `
// 		SELECT * FROM images
// 		WHERE order_of_images=1
// 	`;

//   connection.query(
// 		sql_prompt,
//     (err, results, fields) => {
//       if (err) {
//         console.log('connection error');
//         throw err;
//       }
// 			res.json(results);
//     }
//   );
// });

app.get('/products/:id', (req, res) => {
	const productId = Number(req.params.id);

	if (productId <= 0)
		return res.json({status: 'fatal'});

  connection.query(
    `SELECT products.*, images.id AS image_id
		FROM products
		LEFT JOIN images ON products.id=images.product_id
		WHERE products.id=${productId} AND (images.id IS NULL OR order_of_images=1)`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json(results[0]);
		}
  );
});

app.post('/products', async (req, res) => {
	const productData = req.body.product;
	const imagesData = req.body.images;
	const product = {
		name: productData.name,
		description: productData.description,
		price: productData.price,
		stock: productData.stock,
		category: productData.category,
		shipping_method: productData.shipping_method,
		public_status: productData.public_status,
		popular_status: productData.popular_status
	};
	const productId = await new Promise((resolve) => {
		connection.query(
			`INSERT INTO products SET ?`,
			product,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
				product.id = results.insertId;
				resolve(results.insertId);
			}
		)
	});
	await new Promise((resolve) => {
		connection.query(
			`DELETE FROM images WHERE product_id=${productId}`,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
				resolve(results);
			}
		);
	});
	const images = await Promise.all(imagesData.map(async (data) => {
		if (data.deleted) {
			fs.unlink(`backend/public/products/${data.id}.jpg`, (err) => {});
			return (data);
		} else {
			const image = {
				id: data.id,
				order_of_images: data.order_of_images,
				product_id: productId,
			};
			if (!image.id)
				delete image.id;
			const sql_prompt2 = `
				INSERT INTO images (??) VALUES (?)
				ON DUPLICATE KEY UPDATE `
				+ Object.entries(image).map((field) => `${field[0]}='${field[1]}'`).join();
			return new Promise((resolve) => {
				connection.query(
					sql_prompt2,
					[Object.keys(image), Object.values(image)],
					(err, results, fields) => {
						if (err) {
							console.log(err);
							throw err;
						}
						if (results.insertId)
							data.id = results.insertId;
						resolve(data);
					}
				);
			});
		}
	}));
	return res.json({
		status: 'success',
		product,
		images
	});
});

app.post('/products/:id', async (req, res) => {
	const productId = Number(req.params.id);
	const productData = req.body.product;
	const imagesData = req.body.images;
	const product = {
		id: productData.id,
		name: productData.name,
		description: productData.description,
		price: productData.price,
		stock: productData.stock,
		category: productData.category,
		shipping_method: productData.shipping_method,
		public_status: productData.public_status,
		popular_status: productData.popular_status,
	};
	if (isNaN(productId) || productId !== product.id)
		return res.json({status: 'fatal', message: 'invalid method id.'});

	await new Promise((resolve) => {
		connection.query(
			`UPDATE products SET ?, updated_at=NOW() WHERE id=${product.id}`,
			product,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
				resolve(product.id);
			}
		);
	});
	await new Promise((resolve) => {
		connection.query(
			`DELETE FROM images WHERE product_id=${product.id}`,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
				resolve(results);
			}
		);
	});
	const images = await Promise.all(imagesData.map(async (data) => {
		if (data.deleted) {
			fs.unlink(`backend/public/products/${data.id}.jpg`, (err) => {});
			return (data);
		} else {
			const image = {
				id: data.id,
				order_of_images: data.order_of_images,
				product_id: product.id,
			};
			if (!image.id)
				delete image.id;
			const sql_prompt2 = `
				INSERT INTO images (??) VALUES (?)
				ON DUPLICATE KEY UPDATE `
				+ Object.entries(image).map((field) => `${field[0]}='${field[1]}'`).join();
			return new Promise((resolve) => {
				connection.query(
					sql_prompt2,
					[Object.keys(image), Object.values(image)],
					(err, results, fields) => {
						if (err) {
							console.log(err);
							throw err;
						}
						if (results.insertId)
							data.id = results.insertId;
						resolve(data);
					}
				);
			});
		}
	}));
	return res.json({
		status: 'success',
		product,
		images
	});
});

app.delete('/products/:id', async (req, res) => {
	const productId = Number(req.params.id);

	if (productId <= 0)
		return res.json({status: 'fatal'});

	// 画像を削除
	await new Promise((resolve) => {
		connection.query(
			`SELECT * FROM images WHERE product_id=${productId}`,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
				results.map((image) => {
					fs.unlink(`backend/public/products/${image.id}.jpg`, (err) => {});
				});
				resolve(results);
			}
		)
	});
	// products(db)を削除
	connection.query(
		`DELETE FROM products WHERE id=${productId}`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json({status: 'success'});
		}
	);
});

app.get('/products/:id/images', (req, res) => {
	const productId = Number(req.params.id);

	if (productId <= 0)
		return res.json({status: 'fatal'});
	const sql_prompt = `
		SELECT * FROM images
		WHERE product_id=${productId}
		ORDER BY order_of_images
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

app.get('/images/:id', (req, res) => {
	const imageId = Number(req.params.id);

	if (imageId <= 0)
		return res.json({});
	fs.readFile(
		`backend/public/products/${imageId}.jpg`,
		'base64',
		(err, data) => {
			// console.log(`${data}`.substr(0, 300) + '...');
			res.set('Content-Type', 'image/jpeg');
			res.json(data);
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

app.post('/news', (req, res) => {
	const news = req.body;

	connection.query(
		`INSERT INTO news SET ?`,
		news,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			// res.json(results);
			res.json({status: 'success', message: 'added new news'});
		});
});

app.delete('/news/:id', (req, res) => {
	const newsId = Number(req.params.id);

	if (isNaN(newsId) || newsId <= 0)
		return res.json({status: 'fatal', message: 'invalid news_id'});
	connection.query(
		`DELETE FROM news WHERE id=${newsId}`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			// res.json(results);
			res.json({status: 'success', message: `deleted news id:${newsId}`});
		});
});

app.get('/shipping', (req, res) => {
	connection.query(
		`SELECT * FROM shipping_methods`,
		(err, results, fields) => {
			if (err) { throw err; }
			res.json(results);
		});
});

app.get('/shipping/:id', (req, res) => {
	var methodId = Number(req.params.id);

	if (!methodId)
		return res.json({status: 'fatal', message: 'invalid method id.'});
	connection.query(
		`SELECT * FROM shipping_methods WHERE id=${methodId}`,
		(err, results, fields) => {
			if (err) { throw err }
			res.json(results[0]);
		}
	);
});

app.post('/shipping', async(req, res) => {
	const method = {name: req.body.method.name};
	const feesData = req.body.fees;

	const methodId = await new Promise((resolve) => {
		connection.query(
			`INSERT INTO shipping_methods SET ?`,
			method,
			(err, results, fields) => {
				if (err) throw err;
				method.id = results.insertId;
				resolve(results.insertId);
			}
		);
	});
	if (!methodId)
		return res.json({status: 'fatal'});

	const fees = await Promise.all(feesData.map(async (data) => {
		const fee = {
			size: data.size,
			min_n: data.min_n,
			max_n: data.max_n,
			Hokkaido: data.Hokkaido,
			Tohoku: data.Tohoku,
			Kanto: data.Kanto,
			Sinetsu: data.Sinetsu,
			Hokuriku: data.Hokuriku,
			Tokai: data.Tokai,
			Kinki: data.Kinki,
			Chugoku: data.Chugoku,
			Shikoku: data.Shikoku,
			Kyusyu: data.Kyusyu,
			Okinawa: data.Okinawa,
			method_id: methodId,
		};
		return new Promise((resolve) => {
			connection.query(
				`INSERT INTO shipping_fees SET ?`,
				fee,
				(err, results, fields) => {
					if (err) throw err;
					data.id = results.insertId;
					resolve(data);
				}
			);
		});
	}));
	return res.json({
		status: 'success',
		message: '配送方法を保存しました',
		method,
		fees,
	});
});

app.post('/shipping/:id', async (req, res) => {
	var methodId = Number(req.params.id);
	const feesData = req.body.fees;

	if (isNaN(methodId) || methodId != req.body.method.id)
		return res.json({status: 'fatal', message: 'invalid method id.'});

	const method = {
		id: req.body.method.id,
		name: req.body.method.name,
	};
	
	methodId = await new Promise((resolve) => {
		const sql_prompt = `UPDATE shipping_methods SET ? WHERE id=${methodId}`;
		connection.query(
			sql_prompt,
			method,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
				method.id = (method.id ? method.id : results.insertId);
				resolve(method.id ? method.id : results.insertId);
			}
		);
	});
	if (!methodId)
		return res.json({status: 'fatal'});
	await new Promise((resolve) => {
		connection.query(
			`DELETE FROM shipping_fees WHERE method_id=${methodId}`,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
				resolve(results);
			}
		);
	});
	const fees = await Promise.all(feesData.map(async (data) => {
		const fee = {
			id: data.id,
			size: data.size,
			min_n: data.min_n,
			max_n: data.max_n,
			Hokkaido: data.Hokkaido,
			Tohoku: data.Tohoku,
			Kanto: data.Kanto,
			Sinetsu: data.Sinetsu,
			Hokuriku: data.Hokuriku,
			Tokai: data.Tokai,
			Kinki: data.Kinki,
			Chugoku: data.Chugoku,
			Shikoku: data.Shikoku,
			Kyusyu: data.Kyusyu,
			Okinawa: data.Okinawa,
			method_id: methodId,
		};
		if (!fee.id)
			delete fee.id;
		const sql_prompt = `INSERT INTO shipping_fees SET ?`;
		return new Promise((resolve) => {
			connection.query(
				sql_prompt,
				fee,
				(err, results, fields) => {
					if (err) {
						console.log(err);
						throw err;
					}
					if (!data.id)
						data.id = results.insertId;
					resolve(data);
				}
			);
		});
	}));
	return res.json({
		status: 'success',
		message: '配送方法を保存しました',
		method,
		fees,
	});
})

app.delete('/shipping/:id', (req, res) => {
	const shippingId = Number(req.params.id);

	if (isNaN(shippingId) || shippingId <= 0)
		return res.json({status: 'fatal', message: 'invalid shipping_id'});
	connection.query(
		`UPDATE products SET shipping_method=0 WHERE shipping_method=${shippingId}`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
		}
	);
	connection.query(
		`DELETE FROM shipping_methods WHERE id=${req.params.id}`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json({
				status: 'success'
			});
		}
	);
});

app.get('/shipping/:id/fee', (req, res) => {
	const methodId = Number(req.params.id);

	if (methodId <= 0)
		return res.json({});
	connection.query(`
		SELECT * FROM shipping_fees
		WHERE method_id=${methodId}
		ORDER BY min_n`,
	(err, results, fields) => {
		if (err) {
			console.log('connection error');
			throw err;
		}
		res.json(results);
	});
});

app.get('/orders', (req, res) => {
  connection.query(
    `SELECT
			id,
			checkout_session_id,
			shipping_fee,
			total_amount,
			status,
			DATE_FORMAT(ordered_at, '%Y年%m月%d日 %h:%i') AS ordered_at,
			customer
		FROM orders`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json(results);
		}
  );
});

app.get('/orders/:id', (req, res) => {
	const orderId = req.params.id;

	if (!orderId)
		return res.json({status: 'fatal'});
  connection.query(
    `SELECT
			id,
			checkout_session_id,
			shipping_fee,
			total_amount,
			status,
			DATE_FORMAT(ordered_at, '%Y年%m月%d日 %h:%i') AS ordered_at,
			customer
		FROM orders
		WHERE id='${orderId}'`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json(results[0]);
		}
  );
});

app.post('/orders/:id', (req, res) => {
	const status = req.body.status;
	const orderId = req.params.id;

	if (!orderId)
		return res.json({status: 'fatal'});
	connection.query(`
		UPDATE orders
		SET status='${status}'
		WHERE id='${orderId}'`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json({status: 'success', message: 'updated order status.'})
		}
	);
});

app.get('/ordered_products/:order_id', (req, res) => {
	const orderId = req.params.order_id;

	if (!orderId)
		return res.json({status: 'fatal'});
  connection.query(
    `SELECT * FROM ordered_products WHERE order_id='${orderId}'`,
		(err, results, fields) => {
			if (err) {
				console.log('connection error');
				throw err;
			}
			res.json(results);
		}
  );
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

	if (!orderId)
		return res.json({status: 'fatal'});

	// 同一のorderIdで、未完了の支払いがあるかどうかをチェック
	// await connectionPromise.beginTransaction();
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
		// 在庫確認
		if (stock_status) {
			// await connectionPromise.beginTransaction();
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
		// line_item
		// await connectionPromise.beginTransaction();
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
		// await connectionPromise.beginTransaction();
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
		throw (err);
	});

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
	}));

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

app.post('/stripe-webhook', async (req, res) => {
  const event = req.body;
	const client_reference_id = event.data.object.client_reference_id;
	const connectionPromise = await mysqlPromise.createConnection({
		host: 'localhost',
		user: 'miyu',
		password: '',
		database: 'farm_shop',
		// namedPlaceholders: true
	});

  switch (event.type) {
    case 'payment_intent.succeeded':
			connection.query(`
				UPDATE orders SET status='pending-shipping' WHERE id='${client_reference_id}'`,
				(err, results, fields) => {
					if (err) {
						console.log('connection error');
						throw err;
					}
				}
			);
      break;
    case 'checkout.session.expired':
			const [results] = await connectionPromise.query(`
			SELECT * FROM orders WHERE id='${client_reference_id}'`)
			.catch((err) => {
				console.log('connection error');
				throw err;
			});
			if (!results.length)
				return res.json({received: true});

			// 在庫を戻す
			const [ordered_products] = await connectionPromise.query(`
				SELECT * FROM ordered_products WHERE order_id='${client_reference_id}'`)
			.catch((err) => {
				console.log('connection error');
				throw err;
			});
			ordered_products.map((item) => {
				connection.query(`
					UPDATE products
					SET stock=products.stock+${item.number}
					WHERE id=${item.product_id}`,
					(err, results, fields) => {
						if (err) {
							console.log('connection error');
							throw err;
						}
					}
				);
			});
			// レコード削除
			connection.query(`
			DELETE FROM orders WHERE id='${client_reference_id}'`,
			(err, results, fields) => {
				if (err) {
					console.log('connection error');
					throw err;
				}
			});
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({received: true});
});

app.all("*", (req, res) => {
	console.log('[backend]404 ');
  res.send("404!");
})

app.listen(4242, () => console.log('Running on port 4242'));

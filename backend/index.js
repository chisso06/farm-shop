// memo
// if (err || !results.insertId)
// error messageを全て定数に
// console.log -> res.status(500).json({ error: true })
// ↑の逆

// error messages
const CONNECTION_ERROR = "Error: connection error";
const INVALID_PRODUCT_ID_ERROR = "Error: invalid product id";
const INVALID_BLOG_ID_ERROR = "Error: invalid article id";
const INVALID_ORDER_ID_ERROR = "Error: invalid order id";
const INVALID_ORDERED_PRODUCT_ID_ERROR = "Error: invalid ordered product id";
const INVALID_METHOD_ID_ERROR = "Error: invalid method id";
const INVALID_IMAGE_ID_ERROR = "Error: invalid image id";
const INVALID_NEWS_ID_ERROR = "Error: invalid news id";
const INVALID_SHIPPING_ID_ERROR = "Error: invalid shipping id";
const INVALID_REVIEW_ID_ERROR = "Error: invalid review id";
const INVALID_PRODUCT_STATUS_ERROR = "Error: invalid product status"
const NO_STOCK_ERROR = "Error: no stock";

// config
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const STRIPE_SK_KEY = process.env.STRIPE_SK_KEY;

//stripe
const stripe = require('stripe')(STRIPE_SK_KEY);

// mysql2
const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'miyu',
	password: '',
	database: 'farm_shop'
});
const mysqlPromise = require('mysql2/promise');

// cors
// const cors = require('cors');

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
// app.use(cors());
app.use((req, res, next) => {
	console.log(`[${req.method}] ${req.url}`);

	// cors
	const origin = req.headers.origin;
	// if (origin === FRONTEND_ORIGIN) {
	// 	res.header('Access-Control-Allow-Origin', origin);
	// 	res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	// 	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	// }
	res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
	if ('OPTIONS' == req.method) {
    res.send(204);
  } else {
    next();
  }
});
app.use(express.urlencoded({extended:true}))

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));


app.get('/backend', (req, res) => {
	res.send('Hello World!');
});


/* ==========
	product
========== */

const productsStorage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'backend/public/products'),
	filename: (req, file, cb) => {cb(null, file.originalname)}
});
const uploadProducts = multer({ storage: productsStorage }).array('files[]', 10);
app.post('/backend/upload/products', (req, res) => {
	uploadProducts(req, res, (err) => {
		if (err) {
			console.log("Error: Can't upload files");
			return res.status(500).json({error: true, message: "Error: Can't upload files"});
		} else {
			console.log('body:', req.body);
			console.log('files:', req.files);
			res.status(200).json({ message: "uploaded product images" });
		}
	})
});

app.get('/backend/products', (req, res) => {
	const category = req.query.category;
	const popular_status = Number(req.query.popular_status);
	const public_status = Number(req.query.public_status);

	if (isNaN(popular_status) || isNaN(public_status)) {
		console.error(INVALID_PRODUCT_STATUS_ERROR);
		return res.status(400).json({ message: INVALID_PRODUCT_STATUS_ERROR });
	}

	const sql_prompt = `
		SELECT products.*, images.id AS image_id
		FROM products
		LEFT JOIN images ON products.id=product_id
		WHERE
			${category ? `category='${category}' AND` : ''}
			${popular_status ? `popular_status=1 AND`: ''}
			${public_status ? `public_status>0 AND` : ''}
			(images.id IS NULL OR order_of_images=1)
		ORDER BY public_status ASC
		`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
				console.log(err);
        return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			results.map((p) => {
				if (!p.image_id)
					p.image_id = 0;
			});
			res.status(200).json(results);
    }
  );
});

// app.get('/backend/products/images', (req, res) => {
// 	const sql_prompt = `
// 		SELECT * FROM images
// 		WHERE order_of_images=1
// 	`;

//   connection.query(
// 		sql_prompt,
//     (err, results, fields) => {
//       if (err)
// 				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
// 			res.status(200).json(results);
//     }
//   );
// });

app.get('/backend/products/:id', (req, res) => {
	const productId = Number(req.params.id);
	const public_status = Number(req.query.public_status);

	if (isNaN(productId) || productId <= 0) {
		console.error(INVALID_PRODUCT_ID_ERROR);
		return res.status(400).json({ message: INVALID_PRODUCT_ID_ERROR });
	} else if (isNaN(public_status)) {
		console.error(INVALID_PRODUCT_STATUS_ERROR);
		return res.status(400).json({ message: INVALID_PRODUCT_STATUS_ERROR });
	}

  connection.query(
    `SELECT products.*, images.id AS image_id
		FROM products
		LEFT JOIN images ON products.id=images.product_id
		WHERE
			${public_status ? `public_status>0 AND` : ''}
			products.id=${productId} AND
			(images.id IS NULL OR order_of_images=1)`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results[0]);
		}
  );
});

app.post('/backend/products', async (req, res) => {
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
		popular_status: productData.popular_status,
		subscription: productData.subscription,
	};
	var error_message = '';

	const productId = await new Promise((resolve) => {
		connection.query(
			`INSERT INTO products SET ?`,
			product,
			(err, results, fields) => {
				if (err || !results.insertId) {
					error_message = "Error: could not create product";
					console.error(error_message);
					return ;
				}
				product.id = results.insertId;
				resolve(results.insertId);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	await new Promise((resolve) => {
		connection.query(
			`DELETE FROM images WHERE product_id=${productId}`,
			(err, results, fields) => {
				if (err) {
					connection.query(
						`DELETE FROM products WHERE id=${productId}`,
						(err2) => {
							console.log(err2);
							console.error(CONNECTION_ERROR);
						}
					)
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				resolve(results);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	const images = await Promise.all(imagesData.map(async (data, i) => {
		if (data.deleted) {
			fs.unlink(`backend/public/products/${data.id}.jpg`,
				(err) => {
					if (err)
						console.error("Error: could not unlink image file");
				});
			return (data);
		} else {
			const image = {
				id: data.id,
				order_of_images: i + 1,
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
							connection.query(`
								DELETE FROM products WHERE id=${productId}`,
								(err2) => {
									console.log(err2);
									error_message = CONNECTION_ERROR;
									console.error(error_message);
									return ;
								}
							);
							console.log(err);
							error_message = CONNECTION_ERROR;
							return ;
						}
						if (results.insertId)
							data.id = results.insertId;
						resolve(data);
					}
				);
			});
		}
	}));
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({
		product,
		images
	});
});

app.post('/backend/products/:id', async (req, res) => {
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
		subscription: productData.subscription,
	};
	var error_message = '';

	if (isNaN(productId) || productId !== product.id) {
		console.error(INVALID_METHOD_ID_ERROR);
		return res.status(400).json({ message: INVALID_METHOD_ID_ERROR });
	}

	await new Promise((resolve) => {
		connection.query(
			`UPDATE products SET ?, updated_at=NOW() WHERE id=${product.id}`,
			product,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				resolve(product.id);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	await new Promise((resolve) => {
		connection.query(
			`DELETE FROM images WHERE product_id=${productId}`,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				resolve(results);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	const images = await Promise.all(imagesData.map(async (data, i) => {
		if (data.deleted) {
			fs.unlink(`backend/public/products/${data.id}.jpg`,
				(err) => {
					if (err)
						console.error("Error: could not unlink image file");
				});
			return (data);
		} else {
			const image = {
				id: data.id,
				order_of_images: i + 1,
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
							error_message = CONNECTION_ERROR;
							return ;
						}
						if (results.insertId)
							data.id = results.insertId;
						resolve(data);
					}
				);
			});
		}
	}));
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({
		product,
		images
	});
});

app.delete('/backend/products/:id', async (req, res) => {
	const productId = Number(req.params.id);
	var error_message = '';

	if (isNaN(productId) || productId <= 0) {
		console.error(INVALID_PRODUCT_ID_ERROR);
		return res.status(400).json({ message: INVALID_PRODUCT_ID_ERROR });
	}

	// 画像を削除
	await new Promise((resolve) => {
		connection.query(
			`SELECT * FROM images WHERE product_id=${productId}`,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				results.map((image) => {
					fs.unlink(`backend/public/products/${image.id}.jpg`,
						(err) => {
							if (err)
								console.error("Error: could not unlink image file");
						});
				});
				resolve(results);
			}
		)
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	// products(db)を削除
	connection.query(
		`DELETE FROM products WHERE id=${productId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json({ message: `deleted product ${productId}` });
		}
	);
});

app.get('/backend/products/:id/images', (req, res) => {
	const productId = Number(req.params.id);

	if (productId <= 0) {
		console.error(INVALID_PRODUCT_ID_ERROR);
		return res.status(400).json({ message: INVALID_PRODUCT_ID_ERROR });
	}
	const sql_prompt = `
		SELECT * FROM images
		WHERE product_id=${productId}
		ORDER BY order_of_images
	`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results);
    }
  );
});


/* ==========
	blog
========== */

const blogsStorage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'backend/public/blogs'),
	filename: (req, file, cb) => {cb(null, file.originalname)}
});
const uploadBlogs = multer({ storage: blogsStorage }).array('files[]', 10);
app.post('/backend/upload/blogs', (req, res) => {
	uploadBlogs(req, res, (err) => {
		if (err) {
			console.log("Error: Can't upload files");
			return res.status(500).json({error: true, message: "Error: Can't upload files"});
		} else {
			console.log('body:', req.body);
			console.log('files:', req.files);
			res.status(200).json({ message: "uploaded blog images" });
		}
	})
});

app.get('/backend/blogs', (req, res) => {
	const sql_prompt = `
		SELECT
			id,
			title,
			content,
			id AS image_id,
			DATE_FORMAT(created_at, '%Y年%m月%d日 %H:%i') AS created_at,
			DATE_FORMAT(updated_at, '%Y年%m月%d日 %H:%i') AS updated_at
		FROM blogs
		ORDER BY created_at DESC`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
				console.log(err);
        return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results);
    }
  );
});

// app.get('/backend/blogs/images', (req, res) => {
// 	const sql_prompt = `
// 		SELECT * FROM images
// 		WHERE order_of_images=1
// 	`;

//   connection.query(
// 		sql_prompt,
//     (err, results, fields) => {
//       if (err)
// 				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
// 			res.status(200).json(results);
//     }
//   );
// });

app.get('/backend/blogs/:id', (req, res) => {
	const blogId = Number(req.params.id);

	if (isNaN(blogId) || blogId <= 0) {
		console.error(INVALID_BLOG_ID_ERROR);
		return res.status(400).json({ message: INVALID_BLOG_ID_ERROR });
	}

  connection.query(`
		SELECT
			id,
			title,
			content,
			id AS image_id,
			DATE_FORMAT(created_at, '%Y年%m月%d日 %H:%i') AS created_at,
			DATE_FORMAT(updated_at, '%Y年%m月%d日 %H:%i') AS updated_at
		FROM blogs
		WHERE blogs.id=${blogId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results[0]);
		}
  );
});

app.post('/backend/blogs', async (req, res) => {
	const blogData = req.body;
	const blog = {
		title: blogData.title,
		content: blogData.content,
	};
	var error_message = '';

	await new Promise((resolve) => {
		connection.query(
			`INSERT INTO blogs SET ?`,
			blog,
			(err, results, fields) => {
				if (err || !results.insertId) {
					error_message = "Error: could not create blog";
					console.error(error_message);
					return ;
				}
				blog.id = results.insertId;
				resolve(results.insertId);
			}
		);
	});

	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({ blog });
});

app.post('/backend/blogs/:id', async (req, res) => {
	const blogId = Number(req.params.id);
	const blogData = req.body;
	const blog = {
		id: blogData.id,
		title: blogData.title,
		content: blogData.content
	};
	var error_message = '';

	if (isNaN(blogId) || blogId !== blog.id) {
		console.error(INVALID_BLOG_ID_ERROR);
		return res.status(400).json({ message: INVALID_BLOG_ID_ERROR });
	}

	await new Promise((resolve) => {
		connection.query(
			`UPDATE blogs SET ?, updated_at=NOW() WHERE id=${blog.id}`,
			blog,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				resolve(blog.id);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({ blog });
});

app.delete('/backend/blogs/:id', async (req, res) => {
	const blogId = Number(req.params.id);

	if (isNaN(blogId) || blogId <= 0) {
		console.error(INVALID_BLOG_ID_ERROR);
		return res.status(400).json({ message: INVALID_BLOG_ID_ERROR });
	}

	// 画像を削除
	fs.unlink(`backend/public/blogs/${blogId}.jpg`,
		(err) => {
			if (err)
				console.error("Error: could not unlink image file");
		});

	// blogs(db)を削除
	connection.query(
		`DELETE FROM blogs WHERE id=${blogId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json({ message: `deleted blog ${blogId}` });
		}
	);
});


/* ==========
	article
========== */

const articlesStorage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'backend/public/articles'),
	filename: (req, file, cb) => {cb(null, file.originalname)}
});
const uploadArticles = multer({ storage: articlesStorage }).array('files[]', 10);
app.post('/backend/upload/articles', (req, res) => {
	uploadArticles(req, res, (err) => {
		if (err) {
			console.log("Error: Can't upload files");
			return res.status(500).json({error: true, message: "Error: Can't upload files"});
		} else {
			console.log('body:', req.body);
			console.log('files:', req.files);
			res.status(200).json({ message: "uploaded article images" });
		}
	})
});

app.get('/backend/articles', (req, res) => {
	const sql_prompt = `
		SELECT
			id,
			title,
			content,
			id AS image_id,
			DATE_FORMAT(created_at, '%Y年%m月%d日 %H:%i') AS created_at,
			DATE_FORMAT(updated_at, '%Y年%m月%d日 %H:%i') AS updated_at
		FROM articles
		ORDER BY created_at DESC`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
				console.log(err);
        return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results);
    }
  );
});

// app.get('/backend/articles/images', (req, res) => {
// 	const sql_prompt = `
// 		SELECT * FROM images
// 		WHERE order_of_images=1
// 	`;

//   connection.query(
// 		sql_prompt,
//     (err, results, fields) => {
//       if (err)
// 				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
// 			res.status(200).json(results);
//     }
//   );
// });

app.get('/backend/articles/:id', (req, res) => {
	const articleId = Number(req.params.id);

	if (isNaN(articleId) || articleId <= 0) {
		console.error(INVALID_ARTICLE_ID_ERROR);
		return res.status(400).json({ message: INVALID_ARTICLE_ID_ERROR });
	}

  connection.query(`
		SELECT
			id,
			title,
			content,
			id AS image_id,
			DATE_FORMAT(created_at, '%Y年%m月%d日 %H:%i') AS created_at,
			DATE_FORMAT(updated_at, '%Y年%m月%d日 %H:%i') AS updated_at
		FROM articles
		WHERE articles.id=${articleId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results[0]);
		}
  );
});

app.post('/backend/articles', async (req, res) => {
	const articleData = req.body;
	const article = {
		title: articleData.title,
		content: articleData.content,
	};
	var error_message = '';

	await new Promise((resolve) => {
		connection.query(
			`INSERT INTO articles SET ?`,
			article,
			(err, results, fields) => {
				if (err || !results.insertId) {
					error_message = "Error: could not create article";
					console.error(error_message);
					return ;
				}
				article.id = results.insertId;
				resolve(results.insertId);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({ article });
});

app.post('/backend/articles/:id', async (req, res) => {
	const articleId = Number(req.params.id);
	const articleData = req.body;
	const article = {
		id: articleData.id,
		title: articleData.title,
		content: articleData.content
	};
	var error_message = '';

	if (isNaN(articleId) || articleId !== article.id) {
		console.error(INVALID_ARTICLE_ID_ERROR);
		return res.status(400).json({ message: INVALID_ARTICLE_ID_ERROR });
	}

	await new Promise((resolve) => {
		connection.query(
			`UPDATE articles SET ?, updated_at=NOW() WHERE id=${article.id}`,
			article,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				resolve(article.id);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({ article });
});

app.delete('/backend/articles/:id', async (req, res) => {
	const articleId = Number(req.params.id);

	if (isNaN(articleId) || articleId <= 0) {
		console.error(INVALID_ARTICLE_ID_ERROR);
		return res.status(400).json({ message: INVALID_ARTICLE_ID_ERROR });
	}

	// 画像を削除
	fs.unlink(`backend/public/articles/${articleId}.jpg`,
		(err) => {
			if (err)
				console.error("Error: could not unlink image file");
		});

	// articles(db)を削除
	connection.query(
		`DELETE FROM articles WHERE id=${articleId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json({ message: `deleted article ${articleId}` });
		}
	);
});


/* ==========
	review
========== */

app.get('/backend/reviews', (req, res) => {
	const productId = Number(req.query.product_id);
	const public_status = Number(req.query.public_status);

	if (isNaN(productId) || productId < 0) {
		console.error(INVALID_PRODUCT_ID_ERROR);
		return res.status(400).json({ message: INVALID_PRODUCT_ID_ERROR });
	} else if (isNaN(public_status)) {
		console.error(INVALID_PRODUCT_STATUS_ERROR);
		return res.status(400).json({ message: INVALID_PRODUCT_STATUS_ERROR });
	}

	const sql_prompt = `
		SELECT
			id,
			product_id,
			order_id,
			score,
			title,
			nickname,
			content,
			public_status,
			DATE_FORMAT(created_at, '%Y年%m月%d日') AS created_at
		FROM reviews
		${public_status ? `WHERE public_status='${public_status}' AND` : ''}
		${productId ? `product_id=${productId}` : ''}
		ORDER BY created_at DESC`;

  connection.query(
		sql_prompt,
    (err, results, fields) => {
      if (err) {
				console.log(err);
        return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results);
    }
  );
});

app.get('/backend/reviews/:id', (req, res) => {
	const reviewId = Number(req.params.id);

	if (isNaN(reviewId) || reviewId <= 0) {
		console.error(INVALID_REVIEW_ID_ERROR);
		return res.status(400).json({ message: INVALID_REVIEW_ID_ERROR });
	}

  connection.query(`
		SELECT
			id,
			product_id,
			order_id,
			score,
			title,
			nickname,
			content,
			public_status,
			created_at,
			DATE_FORMAT(created_at, '%Y年%m月%d日') AS created_at
		FROM reviews
		WHERE id=${reviewId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results[0]);
		}
  );
});

app.post('/backend/reviews', async (req, res) => {
	const reviewData = req.body;
	const review = {
		id: reviewData.id,
		product_id: reviewData.product_id,
		order_id: reviewData.order_id,
		score: reviewData.score,
		title: reviewData.title,
		nickname: reviewData.nickname,
		content: reviewData.content,
	};
	var error_message = '';

	await new Promise((resolve) => {
		connection.query(
			`INSERT INTO reviews SET ?`,
			review,
			(err, results, fields) => {
				if (err || !results.insertId) {
					console.error(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				review.id = results.insertId;
				resolve(results.insertId);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({ review });
});

app.post('/backend/reviews/:id', async (req, res) => {
	const reviewId = Number(req.params.id);
	const reviewData = req.body;
	var error_message = '';

	if (isNaN(reviewId)) {
		console.error(INVALID_REVIEW_ID_ERROR);
		return res.status(400).json({ message: INVALID_REVIEW_ID_ERROR });
	}

	await new Promise((resolve) => {
		connection.query(
			`UPDATE reviews SET public_status=${reviewData.public_status} WHERE id=${reviewId}`,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				resolve(reviewId);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({ message: "updated review" });
});


/* ==========
	news
========== */

app.get('/backend/news', (req, res) => {
	connection.query(`
		SELECT id, DATE_FORMAT(date, '%Y年%m月%d日') AS date, content
		FROM news ORDER BY date desc`,
	(err, results, fields) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: true, message: CONNECTION_ERROR });
		}
		res.status(200).json(results);
	});
});

app.post('/backend/news', (req, res) => {
	const newsData = req.body;
	const news = {
		date: newsData.date,
		content: newsData.content,
	};

	connection.query(
		`INSERT INTO news SET ?`,
		news,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json({ message: 'added new news' });
		});
});

app.delete('/backend/news/:id', (req, res) => {
	const newsId = Number(req.params.id);

	if (isNaN(newsId) || newsId <= 0) {
		console.error(INVALID_NEWS_ID_ERROR);
		return res.status(400).json({ message: INVALID_NEWS_ID_ERROR });
	}
	connection.query(
		`DELETE FROM news WHERE id=${newsId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json({ message: `deleted news id:${newsId}` });
		});
});


/* ==========
	shipping
========== */

app.get('/backend/shipping', (req, res) => {
	connection.query(
		`SELECT * FROM shipping_methods`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results);
		});
});

app.get('/backend/shipping/:id', (req, res) => {
	var methodId = Number(req.params.id);

	if (isNaN(methodId) || methodId <= 0) {
		console.error(INVALID_METHOD_ID_ERROR);
		return res.status(400).json({ message: INVALID_METHOD_ID_ERROR });
	}
	connection.query(
		`SELECT * FROM shipping_methods WHERE id=${methodId}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results[0]);
		}
	);
});

app.post('/backend/shipping', async(req, res) => {
	const methodData = req.body.method;
	const feesData = req.body.fees;
	var error_message = '';

	const method = {
		name: methodData.name
	};
	const methodId = await new Promise((resolve) => {
		connection.query(
			`INSERT INTO shipping_methods SET ?`,
			method,
			(err, results, fields) => {
				if (err || !results.insertId) {
					error_message = "Error: could not create shipping_method";
					console.error(error_message);
					return ;
				}
				method.id = results.insertId;
				resolve(results.insertId);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: "Error: could not create shipping_method" });

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
					if (err || !results.insertId) {
						connection.query(
							`DELETE FROM shipping_fees WHERE method_id=${methodId}`,
							(err) => {
								if (err)
									console.error("Error: could not delete shipping fees");
							}
						);
						connection.query(
							`DELETE FROM shipping_methods WHERE id=${methodId}`,
							(err) => {
								if (err)
									console.error("Error: could not delete shipping method");
							}
						);
						error_message = "Error: could not create shipping_fee"
						console.error(error_message);
						return ;
					}
					data.id = results.insertId;
					resolve(data);
				}
			);
		});
	}));

	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({
		message: '配送方法を保存しました',
		method,
		fees,
	});
});

app.post('/backend/shipping/:id', async (req, res) => {
	var methodId = Number(req.params.id);
	const methodData = req.body.method;
	const feesData = req.body.fees;
	var error_message = '';

	if (isNaN(methodId) || methodId != req.body.method.id) {
		console.error(INVALID_METHOD_ID_ERROR);
		return res.status(400).json({ message: INVALID_METHOD_ID_ERROR });
	}

	const method = {
		id: methodData.id,
		name: methodData.name,
	};
	
	methodId = await new Promise((resolve) => {
		const sql_prompt = `UPDATE shipping_methods SET ? WHERE id=${methodId}`;
		connection.query(
			sql_prompt,
			method,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				method.id = (method.id ? method.id : results.insertId);
				resolve(method.id ? method.id : results.insertId);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	else if (!methodId) {
		console.error("Error: could not update shipping_method")
		return res.status(500).json({ error: true, message: 'Error: could not update shipping_method' });
	}

	await new Promise((resolve) => {
		connection.query(
			`DELETE FROM shipping_fees WHERE method_id=${methodId}`,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
				resolve(results);
			}
		);
	});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

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
						error_message = CONNECTION_ERROR;
						return ;
					}
					if (!data.id)
						data.id = results.insertId;
					resolve(data);
				}
			);
		});
	}));
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });
	return res.status(200).json({
		message: '配送方法を保存しました',
		method,
		fees,
	});
})

app.delete('/backend/shipping/:id', (req, res) => {
	const shippingId = Number(req.params.id);
	var error_message = '';

	if (isNaN(shippingId) || shippingId <= 0) {
		console.error(INVALID_SHIPPING_ID_ERROR);
		return res.status(400).json({ message: INVALID_SHIPPING_ID_ERROR });
	}
	connection.query(
		`UPDATE products SET shipping_method=0 WHERE shipping_method=${shippingId}`,
		(err) => {
			if (err) {
				console.log(err);
				error_message = CONNECTION_ERROR;
				return ;
			}
		}
	);
	if (error_message)
		return res.status(500).json({ error: true, message: error_message })

	connection.query(
		`DELETE FROM shipping_methods WHERE id=${req.params.id}`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json({ message: `deleted shipping_method id:${shippingId}` });
		}
	);
});

app.get('/backend/shipping/:id/fee', (req, res) => {
	const methodId = Number(req.params.id);

	if (methodId <= 0) {
		console.error(INVALID_METHOD_ID_ERROR);
		return res.status(400).json({ message: INVALID_METHOD_ID_ERROR });
	}
	connection.query(`
		SELECT * FROM shipping_fees
		WHERE method_id=${methodId}
		ORDER BY min_n`,
	(err, results, fields) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: true, message: CONNECTION_ERROR });
		}
		res.status(200).json(results);
	});
});


/* ==========
	order
========== */

app.get('/backend/orders', (req, res) => {
  connection.query(
    `SELECT
			id,
			checkout_session_id,
			shipping_fee,
			total_amount,
			status,
			DATE_FORMAT(ordered_at, '%Y年%m月%d日 %H:%i') AS ordered_at,
			customer
		FROM orders
		ORDER BY ordered_at DESC`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results);
		}
  );
});

app.get('/backend/orders/:id', (req, res) => {
	const orderId = req.params.id;

	if (!orderId) {
		console.error(INVALID_ORDER_ID_ERROR);
		return res.status(400).json({ message: INVALID_ORDER_ID_ERROR });
	}
  connection.query(
    `SELECT
			id,
			checkout_session_id,
			shipping_fee,
			total_amount,
			status,
			DATE_FORMAT(ordered_at, '%Y年%m月%d日 %H:%i') AS ordered_at,
			customer
		FROM orders
		WHERE id='${orderId}'
		ORDER BY ordered_at DESC`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results[0]);
		}
  );
});

app.post('/backend/orders/:id', (req, res) => {
	const status = req.body.status;
	const orderId = req.params.id;

	if (!orderId) {
		console.error(INVALID_ORDER_ID_ERROR);
		return res.status(400).json({ message: INVALID_ORDER_ID_ERROR });
	}
	connection.query(`
		UPDATE orders
		SET status='${status}'
		WHERE id='${orderId}'`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json({ message: 'updated order status' })
		}
	);
});

app.get('/backend/ordered_products', (req, res) => {
	const orderId = req.query.order_id;

	if (!orderId) {
		console.error(INVALID_ORDER_ID_ERROR);
		return res.status(400).json({ message: INVALID_ORDER_ID_ERROR });
	}
  connection.query(
    `SELECT * FROM ordered_products WHERE order_id='${orderId}'`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results);
		}
  );
});

app.get('/backend/ordered_products/:id', (req, res) => {
	const orderedProductId = Number(req.params.id);

	if (isNaN(orderedProductId) || orderedProductId <= 0) {
		console.error(INVALID_ORDERED_PRODUCT_ID_ERROR);
		return res.status(400).json({ message: INVALID_ORDERED_PRODUCT_ID_ERROR });
	}
  connection.query(
    `SELECT * FROM ordered_products WHERE id='${orderedProductId}'`,
		(err, results, fields) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ error: true, message: CONNECTION_ERROR });
			}
			res.status(200).json(results[0]);
		}
  );
});


/* ==========
	stripe
========== */

app.post('/backend/create-checkout-session', async (req, res) => {
	const orderId = crypto.randomUUID().substring(0, 8).toUpperCase();;
	const cart = req.body.cart;
	const customer = req.body.customer;
	const connectionPromise = await mysqlPromise.createConnection({
		host: 'localhost',
		user: 'miyu',
		password: '',
		database: 'farm_shop',
		// namedPlaceholders: true
	});
	const mode = cart[0].subscription ? 'subscription' : 'payment';
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

	for (var i = 0; i < cart.length; i ++) {
		if (cart[i].subscription && (cart[i].number !== 1 || i !== 0)) {
			console.log("Error: invalid subscription purchase")
			return res.status(500).json({ error: true, message: "Error: invalid subscription purchase" });
		}
	}

	// 商品確認
	var valid_status = 1;
	var stock_status = 1;
	var error_message = '';
	await Promise.all(cart.map(async (item, i) => {
		if (valid_status && stock_status) {
			// await connectionPromise.beginTransaction();
			const [results] = await connectionPromise.query(
				`SELECT stock FROM products WHERE id=${item.product_id} AND public_status>0`
			).catch((err) => {
				console.log(err);
				error_message =  CONNECTION_ERROR;
				return ;
			});
			if (error_message)
				return ;
			if (!results.length) {
				valid_status = 0;
				return ;
			}
			const stock = results[0].stock;
			item['stock'] = stock;
			if (stock < 0 || stock < item.number)
				stock_status = 0;
		}
	}));
	if (error_message) {
		return res.status(500).json({ error: true, message: error_message });
	} else if (!valid_status) {
		console.error("Error: not available product");
		return res.status(500).json({ error: true, message: "Error: not available product" });
	} else if (!stock_status) {
		console.error(NO_STOCK_ERROR);
		return res.status(500).json({ error: true, message: NO_STOCK_ERROR });
	}

	// line_itemsの作成、shippingMethods(配送方法の種類と数)の作成、合計額の計算
	cart.map((item, i) => {
		// shipping_method
		const s_i = shippingMethods.findIndex(
			({method_id}) => method_id === item.shipping_method);
		if (s_i < 0)
			shippingMethods.push({method_id: item.shipping_method, number: item.number});
		else
			shippingMethods[s_i].number += item.number;
	});

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
				console.log(err);
				error_message = CONNECTION_ERROR;
				return ;
			}
		);
		if (error_message)
			return ;
		var i = 0;
		while (i < results.length - 1 && (method.number < results[i].min_n || results[i].max_n < method.number))
			i ++;
		const area = areaList.find((area) => area.prefectures.find((p) => p === customer.prefecture));
		shipping_fee += results[i][area.method_name];
	}));
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	await Promise.all(cart.map(async (item, i) => {
		// await connectionPromise.beginTransaction();
		const [results] = await connectionPromise.query(
			`SELECT name, price FROM products WHERE id=${item.product_id}`
		).catch((err) => {
			console.log(err);
			error_message = CONNECTION_ERROR;
			return ;
		});
		if (error_message)
			return ;

		// calculate total amount
		total_amount += results[0].price * item.number;

		// line_items
		if (mode === 'payment') {
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
			const shipping_line_item = {
				price_data: {
					currency: 'jpy',
					product_data: {
						name: '送料'
					},
					unit_amount: shipping_fee
				},
				quantity: 1,
			};
			line_items.push(shipping_line_item);
		} else {
			const price = await stripe.prices.create({
				currency: 'jpy',
				product_data: {
					name: results[0].name + "(送料込み)"
				},
				recurring: {
					interval: 'month',
				},
				unit_amount: results[0].price + shipping_fee,
			}).catch((err) => {
				error_message = "Error: could not create price";
				console.error(error_message);
				return ;
			});
			if (error_message)
				return ;
			const line_item = {
				price: price.id,
				quantity: 1,
			};
			line_items.push(line_item);
		}
	}));
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	var create_checkout_session_data = {
		client_reference_id: orderId,
		customer_email: customer.email,
		line_items,
		mode,
		expires_at: Math.floor(Date.now() / 1000) + (60 * 30),
		success_url: `${FRONTEND_ORIGIN}/order-completed?order_id=${orderId}`,
		cancel_url: `${FRONTEND_ORIGIN}/cart`,
	};
	const session = await stripe.checkout.sessions.create(create_checkout_session_data)
		.catch((err) => {
			console.log(err);
			error_message = "Error: could not create stripe session";
			console.error(error_message);
			return ;
		});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

	await Promise.all(cart.map(async (item, i) => {
		// 在庫更新
		connection.query(`
			UPDATE products SET stock=${item.stock - item.number} WHERE id=${item.product_id}`,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					error_message = CONNECTION_ERROR;
					return ;
				}
			}
		);
	}));
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

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
				console.log(err);
				error_message = CONNECTION_ERROR;
				console.error(error_message);
				return ;
			}
		});
	if (error_message)
		return res.status(500).json({ error: true, message: error_message });

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
					connection.query(`DELETE FROM orders WHERE id='${orderId}'`,
						(err2) => {
							console.log(err2);
							error_message = CONNECTION_ERROR;
							console.error(error_message);
						});
						connection.query(`DELETE FROM ordered_products WHERE order_id='${orderId}'`,
						(err2) => {
							console.log(err2);
							error_message = CONNECTION_ERROR;
							console.error(error_message);
						});
						console.log(err);
						error_message = CONNECTION_ERROR;
						console.error(error_message);
						return ;
					}
				});
			});
	if (error_message)		
		return res.status(500).json({ error: true, message: error_message });
	res.status(200).json({session_url: session.url});
});

app.post('/backend/stripe-webhook', async (req, res) => {
  const event = req.body;
	const connectionPromise = await mysqlPromise.createConnection({
		host: 'localhost',
		user: 'miyu',
		password: '',
		database: 'farm_shop',
		// namedPlaceholders: true
	});
	const orderId = event.data.object.client_reference_id;
	const sessionId = event.data.object.id;
	var error_message = '';

  switch (event.type) {
		case 'checkout.session.async_payment_failed':
		case 'checkout.session.expired':
			console.log(`Event type: [${event.type}]`);
			console.log('orderId: ', orderId);
			const [results] = await connectionPromise.query(`
				SELECT * FROM orders
				WHERE id='${orderId}' AND status='pending-payment'`)
			.catch((err) => {
				console.log(err);
				error_message = CONNECTION_ERROR;
				return ;
			});
			if (error_message)
				return res.status(500).json({ error: true, message: error_message });
			if (!results.length)
				break ;

			// 在庫を戻す
			const [ordered_products] = await connectionPromise.query(`
				SELECT * FROM ordered_products WHERE order_id='${orderId}'`)
			.catch((err) => {
				console.log(err);
				error_message = CONNECTION_ERROR;
				return ;
			});
			if (error_message)
				return res.status(500).json({ error: true, message: error_message });

			ordered_products.map((item) => {
				connection.query(`
					UPDATE products
					SET stock=products.stock+${item.number}
					WHERE id=${item.product_id}`,
					(err, results, fields) => {
						if (err) {
							console.log(err);
							error_message = CONNECTION_ERROR;
							return ;
						}
					}
				);
			});
			if (error_message)
				return res.status(500).json({ error: true, message: error_message });

			// レコード削除
			connection.query(`
				DELETE FROM orders WHERE id='${orderId}'`,
				(err, results, fields) => {
					if (err) {
						console.log(err);
						error_message = CONNECTION_ERROR;
						return ;
					}
				});
			if (error_message)
				return res.status(500).json({ error: true, message: error_message });
      break;
		case 'checkout.session.async_payment_succeeded':
		case 'checkout.session.completed':
			console.log(`Event type: [${event.type}]`);
			console.log('orderId: ', orderId);
			const session = await stripe.checkout.sessions.retrieve(sessionId);
			if (session.payment_status === 'paid') {
				connection.query(`
					UPDATE orders SET status='pending-shipping'
					WHERE id='${orderId}' AND status='pending-payment'`,
					(err, results, fields) => {
						if (err) {
							console.log(err);
							error_message = CONNECTION_ERROR;
							return ;
						}
					}
				);
			}
			if (error_message)
				return res.status(500).json({ error: true, message: error_message });
			break ;
    default:
      console.log(`Unhandled event type: [${event.type}]`);
  }
  res.status(200).json({received: true});
});


/* ==========
	others
========== */

app.get('/backend/test', (req, res) => {
	res.status(200).json({ message: "Hello World!" });
});

app.get('/backend/images/:id', (req, res) => {
	const imageId = Number(req.params.id);
	const tableName = req.query.table;

	if (imageId <= 0) {
		console.error(INVALID_IMAGE_ID_ERROR);
		return res.status(400).json({ message: INVALID_IMAGE_ID_ERROR });
	} else if (tableName !== 'products' && tableName !== 'blogs' && tableName !== 'articles') {
		console.error("Error: invalid table name");
		return res.status(400).json({ message: "Error: invalid table name" });
	}

	fs.readFile(
		`backend/public/${tableName}/${imageId}.jpg`,
		'base64',
		(err, data) => {
			if (err)
				console.error("Error: could not read image file");
			res.set('Content-Type', 'image/jpeg');
			res.status(200).json(data);
		}
	);
});


// app.all("*", (req, res) => {
// 	console.log('[backend]404 ');
//   return res.status(404).json({ message: "not exist path" });
// })

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname,'../frontend/build/index.html'));
});

// app.listen(4242, () => {
// 	console.log('Running on port 4242');
// });

app.listen(PORT, () => {
	console.log('Running on port ' + PORT);
	console.log('FRONTEND_ORIGIN: ' + FRONTEND_ORIGIN);
});
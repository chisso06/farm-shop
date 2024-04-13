USE farm_shop

CREATE TABLE orders (
  id VARCHAR(20) PRIMARY KEY,
  shipping_name VARCHAR(10) NOT NULL,
  shipping_fee INT NOT NULL,
  total_amount INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending-payment',
  ordered_at DATE NOT NULL DEFAULT (CURRENT_DATE),
  customer JSON NOT NULL
);

CREATE TABLE ordered_products (
  order_id VARCHAR(20) NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  number INT NOT NULL,
  INDEX order_index (order_id),
	FOREIGN KEY (order_id)
		REFERENCES orders(id)
		ON UPDATE CASCADE ON DELETE CASCADE,
	UNIQUE order_product_index (order_id, product_id)
);

INSERT INTO orders (
  id,
  shipping_name,
  shipping_fee,
  total_amount,
  status,
  customer
) VALUES (
  'TH1HOGEH',
  '配送方法1',
  100,
  1000,
  'pending-payment',
  '{
    "name": "田中花子",
    "phone": "09011111111",
    "email": "tanaka-hanako@gmail.com",
    "zipCode": "6310001",
    "preference": "奈良県",
    "address": "奈良市中登美ヶ丘4-1-2-103",
    "memo": "あああああ"
  }'
), (
  'TT2HOGEH',
  '配送方法2',
  150,
  2000,
  'pending-shipping',
  '{
    "name": "田中太郎",
    "phone": "09022222222",
    "email": "tanaka-taro@gmail.com",
    "zipCode": "6310002",
    "preference": "東京都",
    "address": "港区中登美ヶ丘4-1-2-103",
    "memo": "いいいいい"
  }'
), (
  'YH3HOGEH',
  '配送方法3',
  400,
  3000,
  'shipping',
  '{
    "name": "山田花子",
    "phone": "09033333333",
    "email": "yamada-hanako@gmail.com",
    "zipCode": "6310003",
    "preference": "北海道",
    "address": "札幌市中登美ヶ丘4-1-2-103",
    "memo": "ううううう"
  }'
), (
  'YT4HOGEH',
  '配送方法1',
  200,
  4000,
  'completed',
  '{
    "name": "山田太郎",
    "phone": "09044444444",
    "email": "yamada-taro@gmail.com",
    "zipCode": "6310004",
    "preference": "福岡県",
    "address": "福岡市中登美ヶ丘4-1-2-103",
    "memo": "えええええ"
  }'
), (
  'ST5HOGEH',
  '配送方法2',
  300,
  5000,
  'pending',
  '{
    "name": "鈴木太郎",
    "phone": "09055555555",
    "email": "suzuki-hanako@gmail.com",
    "zipCode": "6310005",
    "preference": "沖縄県",
    "address": "那覇市中登美ヶ丘4-1-2-103",
    "memo": "おおおおお"
  }'
);

INSERT INTO ordered_products (
  order_id,
  product_id,
  name,
  price,
  number
) VALUES (
  'TH1HOGEH',
  1,
  '[6個入り]フィナンシェ ホワイトチョコレート',
  1000,
  1
), (
  'TT2HOGEH',
  2,
  '[4個入り]ミニ米粉ケーキ ホワイトチョコレート',
  2000,
  1
), (
  'YH3HOGEH',
  3,
  '[4個入り]ミニかぼちゃケーキ ホワイトチョコレート',
  3000,
  1
), (
  'YT4HOGEH',
  1,
  '[6個入り]フィナンシェ ホワイトチョコレート',
  1000,
  2
),(
  'YT4HOGEH',
  2,
  '[4個入り]ミニ米粉ケーキ ホワイトチョコレート',
  2000,
  1
), (
  'ST5HOGEH',
  4,
  '[8個入り]フィナンシェ ホワイトチョコレート',
  1500,
  1
), (
  'ST5HOGEH',
  6,
  '[6個入り]ミニかぼちゃケーキ ホワイトチョコレート',
  3500,
  1
);

SELECT
  id,
  shipping_name,
  shipping_fee,
  total_amount,
  status
FROM orders;

SELECT * FROM ordered_products;

SELECT
  orders.id,
  total_amount,
  status,
  order_id,
  product_id,
  price,
  number
FROM orders INNER JOIN ordered_products ON orders.id=order_id;

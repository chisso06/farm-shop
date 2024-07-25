USE farm_shop;

CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
	product_id INT NOT NULL,
	order_id VARCHAR(20) NOT NULL,
  score INT NOT NULL,
  title VARCHAR(20) NOT NULL,
  nickname VARCHAR(20) NOT NULL,
  content VARCHAR(1000) NOT NULL,
	public_status INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	INDEX products_index (product_id),
	FOREIGN KEY (product_id)
		REFERENCES products(id)
		ON UPDATE CASCADE ON DELETE CASCADE,
	INDEX orders_index (order_id),
	FOREIGN KEY (order_id)
		REFERENCES orders(id)
		ON UPDATE CASCADE ON DELETE CASCADE,
	UNIQUE order_product_index (product_id, order_id)
);

INSERT INTO reviews (
	id,
	product_id,
	order_id,
	public_status,
	score,
	title,
	nickname,
	content
) values (
	4,
	1,
	'YT4HOGEH',
	1,
	5,
	'毎日のおやつに最適！',
	'やまだたろう',
	'本当に良い買い物をしました。フィナンシェのしっとりとした食感が特徴で、ホワイトチョコレートの甘さがさらに引き立てています。小さなサイズなので、一口で食べられるのが便利ですし、コーヒーや紅茶のお供に最適です。個包装されているので持ち運びにも便利で、毎日のおやつに最適です。'
), (
	5,
	2,
	'YT4HOGEH',
	1,
	5,
	'リピ買いです。ハマりました笑',
	'Y.T.',
	'驚くほど美味しいです！米粉を使用したケーキは、ふんわりとした食感でありながらもしっとりとしていて、口の中で溶けていく感じがたまりません。特にホワイトチョコレートのコーティングが絶妙で、甘さ控えめで上品な味わいです。一口サイズなので、ちょっとした小腹が空いたときや、お茶のお供にぴったりです。パッケージも可愛らしくて、贈り物としても喜ばれること間違いなしです。また、個別包装されているので持ち運びにも便利です。これからもリピートしたいお気に入りの一品です。'
);

SELECT
	id,
	product_id,
	order_id,
	score,
	title,
	nickname,
	public_status,
	created_at
FROM reviews;

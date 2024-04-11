USE farm_shop;

CREATE TABLE images (
  id INT PRIMARY KEY AUTO_INCREMENT,
	order_of_images INT NOT NULL,
	product_id INT NOT NULL,
	INDEX products_index (product_id),
	FOREIGN KEY (product_id)
		REFERENCES products(id)
		ON UPDATE CASCADE ON DELETE CASCADE,
	UNIQUE order_product_index (order_of_images, product_id)
) ENGINE=INNODB;

-- /*
INSERT INTO images (
  order_of_images,
	product_id
) values (
  1,
	1
);

INSERT INTO images (
  order_of_images,
	product_id
) values (
  1,
	2
);

INSERT INTO images (
  order_of_images,
	product_id
) values (
  1,
	3
);

INSERT INTO images (
  order_of_images,
	product_id
) values (
  1,
	4
);

INSERT INTO images (
  order_of_images,
	product_id
) values (
  1,
	5
);

INSERT INTO images (
  order_of_images,
	product_id
) values (
  1,
	6
);

-- Expect: Error
INSERT INTO images (
  order_of_images,
	product_id
) values (
  1,
	3
);

SELECT * FROM images;
-- */

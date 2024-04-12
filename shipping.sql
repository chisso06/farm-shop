USE farm_shop;

CREATE TABLE shipping_methods (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(10) NOT NULL
);

CREATE TABLE shipping_fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
	size VARCHAR(10) NOT NULL,
	min_n INT NOT NULL,
	max_n INT NOT NULL,
	CHECK (min_n <= max_n),
	Hokkaido INT NOT NULL DEFAULT 0,
	Tohoku INT NOT NULL DEFAULT 0,
	Kanto INT NOT NULL DEFAULT 0,
	Sinetsu INT NOT NULL DEFAULT 0,
	Hokuriku INT NOT NULL DEFAULT 0,
	Tokai INT NOT NULL DEFAULT 0,
	Kinki INT NOT NULL DEFAULT 0,
	Chugoku INT NOT NULL DEFAULT 0,
	Shikoku INT NOT NULL DEFAULT 0,
	Kyusyu INT NOT NULL DEFAULT 0,
	Okinawa INT NOT NULL DEFAULT 0,
	method_id INT NOT NULL,
	INDEX shipping_index (method_id),
	FOREIGN KEY (method_id)
		REFERENCES shipping_methods(id)
		ON UPDATE CASCADE ON DELETE CASCADE,
	UNIQUE order_product_index (size, method_id)
) ENGINE=INNODB;

-- /*
INSERT INTO shipping_methods (
	name
) values (
	"配送方法1"
);

INSERT INTO shipping_methods (
	name
) values (
	"配送方法2"
);

INSERT INTO shipping_methods (
	name
) values (
	"配送方法3"
);

INSERT INTO shipping_fees (
	method_id,
	size, min_n, max_n,
	Hokkaido, Tohoku,
	Kanto, Sinetsu, Hokuriku, Tokai,
	Kinki, Chugoku, Shikoku,
	Kyusyu, Okinawa
) values (
	1,
	20, 1, 3,
	100, 100,
	100, 100, 100, 100,
	100, 100, 100,
	100, 100
), (
	1,
	60, 4, 6,
	200, 200,
	200, 200, 200, 200,
	200, 200, 200,
	200, 200
), (
	2,
	20, 1, 3,
	150, 150,
	150, 150, 150, 150,
	150, 150, 150,
	150, 150
), (
	2,
	40, 4, 6,
	300, 300,
	300, 300, 300, 300,
	300, 300, 300,
	300, 300
), (
	3,
	40, 1, 3,
	400, 400,
	400, 400, 400, 400,
	400, 400, 400,
	400, 400
), (
	3,
	60, 4, 6,
	600, 600,
	600, 600, 600, 600,
	600, 600, 600,
	600, 600
);

SELECT
	shipping_methods.*,
	shipping_fees.id AS fee_id,
	size, min_n, max_n,
	method_id
FROM shipping_methods
INNER JOIN shipping_fees ON shipping_methods.id=shipping_fees.method_id;
-- */

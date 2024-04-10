USE farm_shop;

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  price INT NOT NULL,
  stock INT NOT NULL,
  category VARCHAR(100),
  shipping_method INT NOT NULL DEFAULT 0, -- 送料dbと紐付け
  shipping_size INT NOT NULL DEFAULT 0,
  popular_status INT NOT NULL DEFAULT 0,
  public_status INT NOT NULL DEFAULT 1,
  created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
  updated_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);

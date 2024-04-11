USE farm_shop;

CREATE TABLE news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  content VARCHAR(100) NOT NULL
);

-- /*
INSERT INTO news (
  date,
  content
) values (
  '2023-10-01',
  'MHK『ひだまりTV』に出演します。'
);
INSERT INTO news (
  date,
  content
) values (
  '2023-09-10',
  'ひだまりメディアに取材されました。'
);
INSERT INTO news (
  date,
  content
) values (
  '2023-05-25',
  'ひだまり新聞にコラムが掲載されました。'
);

SELECT * FROM news;
-- */

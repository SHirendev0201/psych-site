-- ============================================================
-- IQ (логик чадвар) тест: 20 асуулт, 80 сонголт.
-- 001_schema.sql-ийн дараа ажиллуулна.
-- Оноо: зөв хариулт = хүндрэлийн оноо (хөнгөн 1, дунд 2, хүнд 3),
--       буруу = 0. Дээд оноо 35.
-- Анхаар: асуултууд өөрсдийн зохиосон, стандартчилагдаагүй тул
-- үр дүн нь бодит IQ оноо биш, зөвхөн ойролцоо үнэлгээ.
-- ============================================================

USE psych_site;

INSERT INTO tests (title, description, test_type, time_limit_seconds)
VALUES ('Логик сэтгэлгээний тест',
        'Тоон дараалал, үг хоорондын холбоо, логик, бодлого. Энэ нь стандартчилагдсан IQ тест биш, зөвхөн ойролцоо үнэлгээ.',
        'iq', 1200);
SET @iq = LAST_INSERT_ID();

-- 1. [numeric, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, '5, 10, 15, 20, ? Дараагийн тоо юу вэ?', 1, 'numeric', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '22', 0, 1),
  (@q, '25', 1, 2),
  (@q, '30', 0, 3),
  (@q, '35', 0, 4);

-- 2. [verbal, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Шувуу : далавч = загас : ?', 2, 'verbal', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Усан', 0, 1),
  (@q, 'Сэрвээ', 1, 2),
  (@q, 'Хөл', 0, 3),
  (@q, 'Далай', 0, 4);

-- 3. [math, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, '200-ийн 15 хувь хэд вэ?', 3, 'math', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '20', 0, 1),
  (@q, '25', 0, 2),
  (@q, '30', 1, 3),
  (@q, '35', 0, 4);

-- 4. [logic, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Бүх муур амьтан. Тоби бол муур. Дараахаас аль нь заавал үнэн вэ?', 4, 'logic', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Тоби бол амьтан', 1, 1),
  (@q, 'Тоби бол нохой', 0, 2),
  (@q, 'Бүх амьтан муур', 0, 3),
  (@q, 'Тоби муур биш', 0, 4);

-- 5. [numeric, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, '100, 90, 80, 70, ? Дараагийн тоо юу вэ?', 5, 'numeric', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '50', 0, 1),
  (@q, '60', 1, 2),
  (@q, '65', 0, 3),
  (@q, '75', 0, 4);

-- 6. [verbal, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Дараахаас аль нь бусдаасаа ялгаатай вэ?', 6, 'verbal', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Алим', 0, 1),
  (@q, 'Лууван', 1, 2),
  (@q, 'Банан', 0, 3),
  (@q, 'Усан үзэм', 0, 4);

-- 7. [logic, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Бат нь Болдоос өндөр. Болд нь Сараас өндөр. Хэн хамгийн намхан вэ?', 7, 'logic', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Бат', 0, 1),
  (@q, 'Болд', 0, 2),
  (@q, 'Сара', 1, 3),
  (@q, 'Тодорхойгүй', 0, 4);

-- 8. [verbal, хүндрэл 1]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Эмч : эмнэлэг = багш : ?', 8, 'verbal', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Сурагч', 0, 1),
  (@q, 'Ном', 0, 2),
  (@q, 'Сургууль', 1, 3),
  (@q, 'Дэвтэр', 0, 4);

-- 9. [numeric, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, '2, 6, 18, 54, ? Дараагийн тоо юу вэ?', 9, 'numeric', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '108', 0, 1),
  (@q, '148', 0, 2),
  (@q, '162', 2, 3),
  (@q, '216', 0, 4);

-- 10. [verbal, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Өглөө : өдөр = хавар : ?', 10, 'verbal', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Зун', 0, 1),
  (@q, 'Сар', 0, 2),
  (@q, 'Цас', 0, 3),
  (@q, 'Жил', 2, 4);

-- 11. [logic, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Зарим сурагч нь спортчин. Бүх спортчин нь эрүүл. Дараахаас аль нь заавал үнэн вэ?', 11, 'logic', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Бүх сурагч эрүүл', 0, 1),
  (@q, 'Зарим сурагч эрүүл', 2, 2),
  (@q, 'Эрүүл хүн бүр спортчин', 0, 3),
  (@q, 'Ямар ч сурагч спортчин биш', 0, 4);

-- 12. [math, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Нэг ажлыг 3 хүн 6 өдөрт хийдэг. Ижил хурдтай 6 хүн хэдэн өдөрт хийх вэ?', 12, 'math', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '2 өдөр', 0, 1),
  (@q, '3 өдөр', 2, 2),
  (@q, '4 өдөр', 0, 3),
  (@q, '12 өдөр', 0, 4);

-- 13. [numeric, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, '1, 4, 9, 16, 25, ? Дараагийн тоо юу вэ?', 13, 'numeric', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '30', 0, 1),
  (@q, '34', 0, 2),
  (@q, '36', 2, 3),
  (@q, '49', 0, 4);

-- 14. [verbal, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Дараахаас аль нь бусдаасаа ялгаатай вэ?', 14, 'verbal', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Дугуй', 0, 1),
  (@q, 'Гурвалжин', 0, 2),
  (@q, 'Куб', 2, 3),
  (@q, 'Дөрвөлжин', 0, 4);

-- 15. [logic, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Даваа, Лхагва, Баасан, ? Дараагийн өдөр аль нь вэ?', 15, 'logic', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Бямба', 0, 1),
  (@q, 'Мягмар', 0, 2),
  (@q, 'Пүрэв', 0, 3),
  (@q, 'Ням', 2, 4);

-- 16. [math, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Нэг барааны үнэ 20 хувиар буурсны дараа 80,000₮ болсон. Барааны анхны үнэ хэд байсан бэ?', 16, 'math', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '90,000₮', 0, 1),
  (@q, '96,000₮', 0, 2),
  (@q, '100,000₮', 2, 3),
  (@q, '104,000₮', 0, 4);

-- 17. [numeric, хүндрэл 2]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, '1, 2, 4, 7, 11, ? Дараагийн тоо юу вэ?', 17, 'numeric', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '15', 0, 1),
  (@q, '16', 2, 2),
  (@q, '17', 0, 3),
  (@q, '18', 0, 4);

-- 18. [numeric, хүндрэл 3]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, '3, 5, 9, 17, 33, ? Дараагийн тоо юу вэ?', 18, 'numeric', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '49', 0, 1),
  (@q, '57', 0, 2),
  (@q, '65', 3, 3),
  (@q, '66', 0, 4);

-- 19. [logic, хүндрэл 3]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Гурван хайрцагны нэгэнд алт байна. A хайрцаг дээр: Алт энэ хайрцагт байна. B хайрцаг дээр: Алт энэ хайрцагт байхгүй. C хайрцаг дээр: Алт A хайрцагт байхгүй. Зөвхөн нэг бичиг үнэн бол алт аль хайрцагт байна вэ?', 19, 'logic', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'A хайрцагт', 0, 1),
  (@q, 'B хайрцагт', 3, 2),
  (@q, 'C хайрцагт', 0, 3),
  (@q, 'Тодорхойгүй', 0, 4);

-- 20. [math, хүндрэл 3]
INSERT INTO questions (test_id, question_text, sort_order, category, difficulty)
VALUES (@iq, 'Хоёр тооны нийлбэр 20, үржвэр 96. Том тоо аль нь вэ?', 20, 'math', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '10', 0, 1),
  (@q, '12', 3, 2),
  (@q, '14', 0, 3),
  (@q, '16', 0, 4);

-- ------------------------------------------------------------
-- Үр дүнгийн ангилал (нийт оноо 0..35)
-- ------------------------------------------------------------
INSERT INTO results (test_id, min_score, max_score, title, description, advice, show_support_info) VALUES
  (@iq, 0, 7,  'Эхлэлийн түвшин',  'Энэ тестийн асуултуудын цөөн хэсэгт зөв хариуллаа.', 'Логик, тоон дараалалтай төстэй дасгал хийж дахин оролдоод үзээрэй.', FALSE),
  (@iq, 8, 15, 'Дундажаас доош',   'Хөнгөн асуултуудад зөв хариулсан байна.', 'Хүнд асуултуудыг алхам алхмаар задлан бодохыг оролдоорой.', FALSE),
  (@iq, 16, 23,'Дундаж түвшин',    'Дунд зэргийн хүндрэлтэй асуултуудад сайн ажиллалаа.', NULL, FALSE),
  (@iq, 24, 30,'Дундажаас дээш',   'Дунд болон зарим хүнд асуултад зөв хариуллаа.', NULL, FALSE),
  (@iq, 31, 35,'Өндөр түвшин',     'Ихэнх хүнд асуултад зөв хариуллаа.', NULL, FALSE);

-- ------------------------------------------------------------
-- Ойролцоо IQ хязгаар (ТААМАГ: тест стандартчилагдаагүй)
-- Нэг тоо биш мужаар харуулна. 140-өөс дээш таамаглахгүй.
-- ------------------------------------------------------------
UPDATE results SET iq_estimate_min = 70,  iq_estimate_max = 85  WHERE test_id = @iq AND min_score = 0;
UPDATE results SET iq_estimate_min = 85,  iq_estimate_max = 95  WHERE test_id = @iq AND min_score = 8;
UPDATE results SET iq_estimate_min = 95,  iq_estimate_max = 110 WHERE test_id = @iq AND min_score = 16;
UPDATE results SET iq_estimate_min = 110, iq_estimate_max = 125 WHERE test_id = @iq AND min_score = 24;
UPDATE results SET iq_estimate_min = 125, iq_estimate_max = 140 WHERE test_id = @iq AND min_score = 31;

-- ------------------------------------------------------------
-- ШАЛГАЛТ (бүгд зөв бол доорх үр дүнтэй таарна)
-- ------------------------------------------------------------
-- 1) 20 асуулт, 80 сонголт
SELECT COUNT(DISTINCT q.id) AS questions, COUNT(o.id) AS options
FROM questions q JOIN options o ON o.question_id = q.id
WHERE q.test_id = @iq;

-- 2) Дээд оноо 35 байх ёстой
SELECT SUM(best) AS max_score FROM (
  SELECT MAX(o.score) AS best FROM questions q
  JOIN options o ON o.question_id = q.id
  WHERE q.test_id = @iq GROUP BY q.id) x;

-- 2b) 5 ангилал бүгд ойролцоо IQ мужтай байх ёстой
SELECT min_score, max_score, title, iq_estimate_min, iq_estimate_max FROM results WHERE test_id = @iq ORDER BY min_score;

-- 3) Асуулт бүр яг 4 сонголттой, яг 1 зөв хариулттай байх ёстой: ҮР ДҮН ХООСОН байна
SELECT q.id, q.sort_order, COUNT(o.id) AS n_options, SUM(o.score > 0) AS n_correct
FROM questions q JOIN options o ON o.question_id = q.id
WHERE q.test_id = @iq
GROUP BY q.id, q.sort_order
HAVING n_options <> 4 OR n_correct <> 1;

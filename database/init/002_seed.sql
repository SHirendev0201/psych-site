-- ============================================================
-- Туршилтын өгөгдөл. schema.sql-ийг ажиллуулсны дараа ажиллуулна.
-- Анхаар: trauma тестийн асуултууд зөвхөн ЗАГВАР. Бодит
-- хэрэглээнд баталгаажсан асуумж (ACE, PCL-5)-ийг оруулна.
-- ============================================================

USE psych_site;

-- ------------------------------------------------------------
-- 1. IQ тест (логик чадварын ойролцоо үнэлгээ), 5 асуулт
-- ------------------------------------------------------------
INSERT INTO tests (title, description, test_type, time_limit_seconds)
VALUES ('Логик чадварын тест',
        'Тоон дараалал, логик, зүйрлэл. Энэ нь ойролцоо үнэлгээ бөгөөд стандартчилсан IQ тест биш.',
        'iq', 600);
SET @iq = LAST_INSERT_ID();

INSERT INTO questions (test_id, question_text, sort_order)
VALUES (@iq, '2, 4, 8, 16, ? Дараагийн тоо юу вэ?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '24', 0, 1), (@q, '32', 1, 2), (@q, '30', 0, 3), (@q, '36', 0, 4);

INSERT INTO questions (test_id, question_text, sort_order)
VALUES (@iq, '3, 6, 9, 12, ? Дараагийн тоо юу вэ?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '14', 0, 1), (@q, '15', 1, 2), (@q, '16', 0, 3), (@q, '18', 0, 4);

INSERT INTO questions (test_id, question_text, sort_order)
VALUES (@iq, '1, 1, 2, 3, 5, 8, ? Дараагийн тоо юу вэ?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '11', 0, 1), (@q, '12', 0, 2), (@q, '13', 1, 3), (@q, '14', 0, 4);

INSERT INTO questions (test_id, question_text, sort_order)
VALUES (@iq, 'Нэг ажлыг 3 хүн 6 өдөрт хийдэг бол 6 хүн хэдэн өдөрт хийх вэ?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, '2 өдөр', 0, 1), (@q, '3 өдөр', 1, 2), (@q, '4 өдөр', 0, 3), (@q, '12 өдөр', 0, 4);

INSERT INTO questions (test_id, question_text, sort_order)
VALUES (@iq, 'Гар : бугуй = хөл : ?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO options (question_id, option_text, score, sort_order) VALUES
  (@q, 'Шагай', 1, 1), (@q, 'Улаан', 0, 2), (@q, 'Гутал', 0, 3), (@q, 'Хуруу', 0, 4);

INSERT INTO results (test_id, min_score, max_score, title, description, advice, show_support_info) VALUES
  (@iq, 0, 1, 'Эхлэлийн түвшин', 'Энэ тестэд цөөн асуултад зөв хариуллаа.', 'Дасгал хийж дахин оролдоод үзээрэй.', FALSE),
  (@iq, 2, 3, 'Дундаж түвшин', 'Асуултуудын тал орчимд зөв хариуллаа.', NULL, FALSE),
  (@iq, 4, 5, 'Өндөр түвшин', 'Ихэнх асуултад зөв хариуллаа.', NULL, FALSE);

-- ------------------------------------------------------------
-- 2. Trauma / стрессийн шинж тэмдгийн скрининг (ЗАГВАР), 4 асуулт
--    Сонголт бүр: 0 Огт | 1 Заримдаа | 2 Ихэвчлэн | 3 Байнга
-- ------------------------------------------------------------
INSERT INTO tests (title, description, test_type, time_limit_seconds)
VALUES ('Стрессийн шинж тэмдгийн скрининг',
        'Энэ бол оношлогоо биш, зөвхөн өөрийгөө үнэлэх скрининг.',
        'trauma', NULL);
SET @tr = LAST_INSERT_ID();

INSERT INTO questions (test_id, question_text, sort_order) VALUES
  (@tr, 'Сүүлийн сард нойрмог байдал, нойргүйдэлд хэр өртсөн бэ?', 1),
  (@tr, 'Сүүлийн сард тааламжгүй дурсамж санаанд өөрийн эрхгүй орж ирсэн үү?', 2),
  (@tr, 'Сүүлийн сард өдөр тутмын үйл ажиллагаанд төвлөрөхөд хэцүү байсан уу?', 3),
  (@tr, 'Сүүлийн сард түгшүүр, сэрэмжлэл ихэссэн мэт мэдрэмж төрсөн үү?', 4);

INSERT INTO options (question_id, option_text, score, sort_order)
SELECT q.id, v.option_text, v.score, v.score + 1
FROM questions q
JOIN (
  SELECT 'Огт байгаагүй' AS option_text, 0 AS score
  UNION ALL SELECT 'Заримдаа', 1
  UNION ALL SELECT 'Ихэвчлэн', 2
  UNION ALL SELECT 'Байнга', 3
) v
WHERE q.test_id = @tr;

INSERT INTO results (test_id, min_score, max_score, title, description, advice, show_support_info) VALUES
  (@tr, 0, 3, 'Шинж тэмдэг бага', 'Одоогоор шинж тэмдэг бага түвшинд байна.', NULL, FALSE),
  (@tr, 4, 8, 'Дунд түвшин', 'Зарим шинж тэмдэг мэдрэгдэж байна.', 'Шинж тэмдэг үргэлжилбэл мэргэжлийн сэтгэл зүйчтэй ярилцахыг зөвлөж байна.', TRUE),
  (@tr, 9, 12, 'Өндөр түвшин', 'Шинж тэмдэг өндөр түвшинд байна.', 'Мэргэжлийн сэтгэл зүйч, эмчтэй уулзахыг зөвлөж байна. Энэ нь оношлогоо биш.', TRUE);

-- ------------------------------------------------------------
-- 3. Тусламжийн лавлах: БАТАЛГААЖСАН мэдээллийг өөрөө нөхнө
-- ------------------------------------------------------------
-- INSERT INTO support_resources (title, description, phone, url)
-- VALUES ('Байгууллагын нэр', 'Товч тайлбар', 'утасны дугаар', 'вэб хаяг');

-- ------------------------------------------------------------
-- Шалгах: IQ тест 5 асуулт 20 сонголт, Trauma тест 4 асуулт 16 сонголттой байх ёстой
-- ------------------------------------------------------------
SELECT t.title, COUNT(DISTINCT q.id) AS questions, COUNT(o.id) AS options
FROM tests t
JOIN questions q ON q.test_id = t.id
JOIN options o ON o.question_id = q.id
GROUP BY t.id, t.title;

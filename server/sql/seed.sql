USE ucu_lost_found;
-- Sample users are created by the optional seed script. Never place assessment credentials here.
INSERT INTO reports (reporter_id,kind,title,category,description,item_date,location,status)
SELECT id,'found','Blue keyring with keys','Keys','A set of keys with a blue keyring was found after a lecture.','2026-11-16','N5B','open'
FROM users WHERE email='namusoke@example.test' AND NOT EXISTS (SELECT 1 FROM reports WHERE title='Blue keyring with keys' AND location='N5B');

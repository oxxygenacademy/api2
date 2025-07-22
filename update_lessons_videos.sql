-- تحديث الدروس لتشمل روابط فيديو تجريبية
UPDATE lessons SET video_url = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4' WHERE id = 1;
UPDATE lessons SET video_url = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4' WHERE id = 2;
UPDATE lessons SET video_url = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4' WHERE id = 3;

-- أو استخدم روابط YouTube تجريبية
-- UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' WHERE id = 1;
-- UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=9bZkp7q19f0' WHERE id = 2;
-- UPDATE lessons SET video_url = 'https://www.youtube.com/watch?v=ScMzIvxBSi4' WHERE id = 3;

-- أو روابط محلية للاختبار
-- UPDATE lessons SET video_url = '/videos/lesson1.mp4' WHERE id = 1;
-- UPDATE lessons SET video_url = '/videos/lesson2.mp4' WHERE id = 2;
-- UPDATE lessons SET video_url = '/videos/lesson3.mp4' WHERE id = 3;
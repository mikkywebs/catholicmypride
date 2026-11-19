-- 0024: the audio section moved from /music to /audio. Keep each page's view count by moving its history.
-- Safe to run more than once.
update public.page_views set path = '/audio' || substr(path, 7)
where path = '/music' or path like '/music/%';

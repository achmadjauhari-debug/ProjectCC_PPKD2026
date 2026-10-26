-- Aturan nilai yang diizinkan (sesuai spesifikasi), dijaga juga di level database.
ALTER TABLE `users`    ADD CONSTRAINT `chk_users_role`     CHECK (`role` IN ('creator', 'editor', 'admin'));
ALTER TABLE `channels` ADD CONSTRAINT `chk_channels_platform` CHECK (`platform` IN ('youtube', 'tiktok', 'instagram', 'linkedin'));
ALTER TABLE `contents` ADD CONSTRAINT `chk_contents_format`   CHECK (`format_type` IN ('short_video', 'long_video', 'carousel', 'single_post'));
ALTER TABLE `contents` ADD CONSTRAINT `chk_contents_status`   CHECK (`status` IN ('idea', 'scripting', 'recording', 'editing', 'ready', 'published'));
ALTER TABLE `contents` ADD CONSTRAINT `chk_contents_priority` CHECK (`priority` IN ('low', 'medium', 'high'));
-- Status published wajib punya published_url
ALTER TABLE `contents` ADD CONSTRAINT `chk_contents_published_url` CHECK (`status` <> 'published' OR `published_url` IS NOT NULL);

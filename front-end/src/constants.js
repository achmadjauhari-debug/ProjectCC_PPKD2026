export const STATUSES = [
  ['idea', 'Idea backlog'], ['scripting', 'Scripting'], ['recording', 'Recording'],
  ['editing', 'Editing & review'], ['ready', 'Ready'], ['published', 'Published'],
];
export const FORMATS = { short_video: 'Short video', long_video: 'Long video', carousel: 'Carousel', single_post: 'Single post' };
export const PLATFORMS = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', linkedin: 'LinkedIn' };
export const PRIORITIES = ['low', 'medium', 'high'];
export const statusLabel = (s) => STATUSES.find((x) => x[0] === s)?.[1] ?? s;
export const today = () => new Date().toISOString().slice(0, 10);

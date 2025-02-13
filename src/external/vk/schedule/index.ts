import { ScheduleRenderer } from './schedule-renderer.js';

export const scheduleRenderer = new ScheduleRenderer(
	Number(process.env.PAGE_ID)
);

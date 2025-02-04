import { StepScene } from '@vk-io/scenes';
import { Dayjs } from 'dayjs';

import { dateStep } from './steps/dateStep.js';
import { timeStep } from './steps/timeStep.js';

export type SceneCreateEventState = {
	date: Dayjs;
	time: {
		startTime: Dayjs | null;
		endTime: Dayjs | null;
	};
	place: string;
	organizer: string;
	title: string;
};

export const sceneCreateEvent = new StepScene('createEventScene', [
	dateStep,
	timeStep,
]);

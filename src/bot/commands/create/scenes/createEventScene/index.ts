import { StepScene } from '@vk-io/scenes';

import { confirmStep } from './steps/confirmStep.js';
import { dateStep } from './steps/dateStep.js';
import { organizerStep } from './steps/organizerStep.js';
import { placeStep } from './steps/placeStep.js';
import { timeStep } from './steps/timeStep.js';
import { titleStep } from './steps/titleStep.js';

export type SceneCreateEventState = {
	date: Date; // YYYY-MM-DD
	time: {
		startTime: string | null; // HH:mm
		endTime: string | null; // HH:mm
	};
	place: string;
	organizer: string;
	title: string;
};

export const sceneCreateEvent = new StepScene('createEventScene', [
	dateStep,
	timeStep,
	placeStep,
	titleStep,
	organizerStep,
	confirmStep,
]);

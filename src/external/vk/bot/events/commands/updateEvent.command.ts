import { MessageContextWithScene } from '../../shared/types/context.type.js';
import { EVENT_SCENE_NAMES } from '../types/events.types.js';

export async function updateEventCommand(context: MessageContextWithScene) {
	await context.scene.enter(EVENT_SCENE_NAMES.updateEvent);
}

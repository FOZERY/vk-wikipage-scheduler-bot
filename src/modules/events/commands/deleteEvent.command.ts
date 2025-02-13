import { MessageContextWithScene } from '../../../shared/types/context.type.js';
import { EVENT_SCENE_NAMES } from '../types/events.types.js';

export async function deleteEventCommand(context: MessageContextWithScene) {
	return await context.scene.enter(EVENT_SCENE_NAMES.deleteEvent);
}

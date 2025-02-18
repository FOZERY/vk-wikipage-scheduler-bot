import { MessageContextWithScene } from '../../shared/types/context.type.js';
import { EventSceneEnum } from '../types/events.types.js';

export async function updateEventCommand(context: MessageContextWithScene) {
	await context.scene.enter(EventSceneEnum.updateEvent);
}

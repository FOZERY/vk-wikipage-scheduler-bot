import { MessageContextWithScene } from '../../../index.js';

export async function createEventCommand(context: MessageContextWithScene) {
	await context.scene.enter('createEventScene');
}

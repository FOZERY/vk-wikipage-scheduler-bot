import { SceneContext } from '@vk-io/scenes';
import { MessageContext } from 'vk-io';

export type MessageContextWithScene = MessageContext & {
	scene: SceneContext<any>;
};

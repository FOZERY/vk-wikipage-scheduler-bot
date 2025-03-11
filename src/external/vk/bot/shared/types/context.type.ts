import type { SceneContext } from "@vk-io/scenes";
import type { MessageContext } from "vk-io";

export type MessageContextWithScene = MessageContext & {
	scene: SceneContext<any>;
};

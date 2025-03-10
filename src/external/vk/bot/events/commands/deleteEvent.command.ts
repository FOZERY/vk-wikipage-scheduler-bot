import { MessageContextWithScene } from "../../shared/types/context.type.js";
import { EventSceneEnum } from "../types/events.types.js";

export async function deleteEventCommand(context: MessageContextWithScene) {
	return await context.scene.enter(EventSceneEnum.deleteEvent);
}

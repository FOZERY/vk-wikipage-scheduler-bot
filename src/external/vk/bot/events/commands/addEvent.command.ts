import type { ViewEvent } from "../../shared/types/common.types.js";
import type { MessageContextWithScene } from "../../shared/types/context.type.js";
import type { AddEventSceneState } from "../scenes/add-event/add-event.scene.js";
import { EventSceneEnum } from "../types/events.types.js";

export async function addEventCommand(context: MessageContextWithScene) {
	await context.scene.enter(EventSceneEnum.addEvent, {
		state: {
			event: {
				date: "",
				title: "",
				place: "",
				timeRange: null,
				organizer: "",
				lastUpdaterId: context.senderId,
			} as ViewEvent,
		} as AddEventSceneState,
	});
}

import dayjs from "dayjs";
import { MessageContext } from "vk-io";
import {
	DatabaseConstraintError,
	ValidationError,
} from "../../../../../../../shared/errors.js";
import {
	attachTextButtonToKeyboard,
	leaveButtonOptions,
	previousButtonOptions,
} from "../../../../shared/utils/keyboard-utils.js";
import { logStep } from "../../../../shared/utils/logger-messages.js";
import { SceneStepWithDependencies } from "../../../../shared/utils/scene-utils.js";
import { timeRangeToStringOutput } from "../../../../shared/utils/time-utils.js";
import {
	getSelectFieldOrConfirmKeyboard,
	SelectField,
	SelectFieldKeyboardCommand,
	SelectFieldKeyboardPayload,
} from "../../../keyboards/select-field.keyboard.js";
import {
	UpdateEventSceneDependencies,
	UpdateEventSceneState,
	UpdateEventSceneStepNumber,
} from "../update-event.scene.js";

export const selectFieldStep: SceneStepWithDependencies<
	MessageContext,
	UpdateEventSceneState,
	UpdateEventSceneDependencies
> = async (context) => {
	if (context.scene.step.firstTime) {
		logStep(
			context,
			`User ${context.senderId} -> entered select-field step`,
			"info"
		);

		return await context.send(
			`
Вы выбрали следующее событие:
Дата: ${dayjs(context.scene.state.event.date, "YYYY-MM-DD").format(
				"DD.MM.YYYY"
			)}	
Время: ${timeRangeToStringOutput(context.scene.state.event.timeRange)}
Место: ${context.scene.state.event.place}
Название: ${context.scene.state.event.title}
Организатор: ${context.scene.state.event.organizer || "не указан"}

Выберите, что хочешь изменить.	
`,
			{
				keyboard: attachTextButtonToKeyboard(
					getSelectFieldOrConfirmKeyboard(),
					[previousButtonOptions, leaveButtonOptions]
				),
			}
		);
	}

	if (!context.text) {
		return await context.reply(
			`Разрешено вводить только текст, либо пользоваться клавиатурой.`
		);
	}

	if (context.hasMessagePayload) {
		const payload = context.messagePayload as SelectFieldKeyboardPayload;
		// если ввели с клавиатуры
		switch (payload.command) {
			case SelectFieldKeyboardCommand.Leave: {
				return await context.scene.leave();
			}
			case SelectFieldKeyboardCommand.Previous: {
				return await context.scene.step.previous();
			}
			case SelectFieldKeyboardCommand.SelectField: {
				const payload =
					context.messagePayload as SelectFieldKeyboardPayload;
				switch (payload.field) {
					case SelectField.Date: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateDate
						);
					}
					case SelectField.Time: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateTime
						);
					}
					case SelectField.Place: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdatePlace
						);
					}
					case SelectField.Title: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateTitle
						);
					}
					case SelectField.Organizer: {
						return await context.scene.step.go(
							UpdateEventSceneStepNumber.UpdateOrganizer
						);
					}
					default: {
						throw new Error(`Unexpected field: ${payload.field}`);
					}
				}
			}
			case SelectFieldKeyboardCommand.Confirm: {
				const result = await context.dependencies.eventsService.update({
					id: context.scene.state.event.id!,
					...context.scene.state.event,
					lastUpdaterId: context.senderId,
				});

				if (result.isErr()) {
					if (result.error === "Event not found") {
						logStep(
							context,
							`User ${context.senderId} -> event not found in confirm step of update scene`,
							"warn"
						);

						return await context.send("Событие не найдено.");
					}

					if (result.error instanceof DatabaseConstraintError) {
						logStep(
							context,
							`User ${context.senderId} -> database constraint error in confirm step of update scene`,
							"warn",
							result.error
						);

						return await context.send(
							"Ошибка при обновлении события: Событие на это время и место уже существует."
						);
					}

					if (result.error instanceof ValidationError) {
						logStep(
							context,
							`User ${context.senderId} -> validation error in confirm step of update scene`,
							"error",
							result.error
						);
						return await context.send("Ошибка сервиса.");
					}
				}

				await context.send("Событие успешно обновлено.");

				logStep(
					context,
					`User ${context.senderId} -> passed select-field step`,
					"info"
				);
				return await context.scene.leave();
			}
			default: {
				logStep(
					context,
					`User ${context.senderId} -> unknown command - ${context.messagePayload.command}`,
					"error"
				);
				throw new Error(
					`Unknown command - ${context.messagePayload.command}`
				);
			}
		}
	} else {
		return await context.reply(`Воспользуйся клавиатурой.`);
	}
};

import { IStepContext } from '@vk-io/scenes';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { ContextDefaultState, MessageContext } from 'vk-io';
dayjs.extend(customParseFormat);

export function isKeyboardAction(
	context: MessageContext<ContextDefaultState>
): boolean {
	return context.messagePayload !== undefined;
}

export function createSceneStep<
	TState extends Record<string, any> = Record<string, any>
>(
	handler: (
		context: IStepContext<TState> &
			MessageContext<ContextDefaultState> & {
				goyda: number;
			}
	) => Promise<void | MessageContext<ContextDefaultState>>
): (
	context: IStepContext<TState> &
		MessageContext<ContextDefaultState> & {
			goyda: number;
		}
) => Promise<void | MessageContext<ContextDefaultState>> {
	return async (
		context: IStepContext<TState> &
			MessageContext<ContextDefaultState> & { goyda: number }
	) => {
		return handler(context);
	};
}

import { IStepContext } from '@vk-io/scenes';
import { ContextDefaultState, MessageContext } from 'vk-io';

export function createSceneStep<
	TState extends Record<string, any> = Record<string, any>
>(
	handler: (
		context: IStepContext<TState> & MessageContext<ContextDefaultState>
	) => Promise<void | MessageContext<ContextDefaultState>>
): (
	context: IStepContext<TState> & MessageContext<ContextDefaultState>
) => Promise<void | MessageContext<ContextDefaultState>> {
	return async (
		context: IStepContext<TState> & MessageContext<ContextDefaultState>
	) => {
		return handler(context);
	};
}

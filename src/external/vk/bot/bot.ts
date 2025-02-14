import { AllowArray, HearConditions, HearManager } from '@vk-io/hear';
import { IScene, Middleware, SceneManager } from '@vk-io/scenes';
import { SessionManager } from '@vk-io/session';
import {
	VK as _VK,
	MessageContextSubType,
	MessageContextType,
	VK,
} from 'vk-io';
import { MessageContextWithScene } from './shared/types/context.type.js';

type VKOptions = {
	token: string;
	preventOutbox: boolean;
	preventChat: boolean;
	hearEvents: AllowArray<MessageContextType | MessageContextSubType>;
};

export class VKExtend extends _VK {
	private hearManager: HearManager<MessageContextWithScene>;
	private sessionManager: SessionManager;
	private sceneManager: SceneManager;

	constructor(options: VKOptions) {
		super({
			token: options.token,
		});
		this.hearManager = new HearManager();
		this.sessionManager = new SessionManager();
		this.sceneManager = new SceneManager();

		if (options.preventOutbox) {
			this.updates.use((context, next) => {
				if (context.isOutbox) {
					return;
				}

				return next();
			});
		}

		if (options.preventChat) {
			this.updates.use((context, next) => {
				if (context.isChat) {
					return;
				}

				return next();
			});
		}

		this.updates.on('message', this.sessionManager.middleware);
		this.updates.on('message_new', [
			this.sceneManager.middleware,
			this.sceneManager.middlewareIntercept,
		]);
		this.updates.on(options.hearEvents, this.hearManager.middleware);
	}

	public addScenes(scenes: IScene[]) {
		this.sceneManager.addScenes(scenes);
	}

	public hasScene(slug: string): boolean {
		return this.sceneManager.hasScene(slug);
	}

	public hear<T = {}>(
		hearConditions: HearConditions<MessageContextWithScene & T>,
		handler: Middleware<MessageContextWithScene & T>
	) {
		this.hearManager.hear(hearConditions, handler);
	}

	public hearOnFallback(handler: Middleware<MessageContextWithScene>) {
		this.hearManager.onFallback(handler);
	}
}

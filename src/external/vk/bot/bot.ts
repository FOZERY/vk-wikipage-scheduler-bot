import { AllowArray, HearConditions, HearManager } from "@vk-io/hear";
import { IScene, Middleware, SceneManager } from "@vk-io/scenes";
import { SessionManager } from "@vk-io/session";
import {
	VK as _VK,
	Context,
	MessageContextSubType,
	MessageContextType,
} from "vk-io";
import { MessageContextWithScene } from "./shared/types/context.type.js";

type VKOptions = {
	token: string;
	preventOutbox: boolean;
	preventChat: boolean;
	hearEvents: AllowArray<MessageContextType | MessageContextSubType>;
	errorHandler?: VKErrorHandler;
};

type VKErrorHandler = (
	error: unknown,
	context?: Context
) => Promise<void> | void;

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

		this.updates.use(async (context, next) => {
			try {
				await next();
			} catch (error) {
				if (options.errorHandler) {
					await options.errorHandler(error, context);
				} else {
					throw error;
				}
			}
		});

		if (options.preventOutbox) {
			this.updates.use(async (context, next) => {
				if (context.isOutbox) {
					return;
				}

				await next();
			});
		}

		if (options.preventChat) {
			this.updates.use(async (context, next) => {
				if (context.isChat) {
					return;
				}

				await next();
			});
		}

		this.updates.on("message", this.sessionManager.middleware);
		this.updates.on("message_new", [
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

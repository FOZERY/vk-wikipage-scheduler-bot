import { HearManager } from "@vk-io/hear";
import { Middleware, SceneManager } from "@vk-io/scenes";
import { MessageContext, VK } from "vk-io";

export class BotVK {
	private vk: VK;
	private hearManager: HearManager<MessageContext>;
	private sceneManager: SceneManager;

	constructor() {
		this.vk = new VK({
			token: process.env.VK_TOKEN,
		});
		this.hearManager = new HearManager();
		this.sceneManager = new SceneManager();
	}

	public on(msg: string, callback: Middleware<MessageContext>) {
		this.hearManager.hear(msg, callback);
	}

	public async start() {
		this.vk.updates.on("message_new", [this.hearManager.middleware]);

		this.vk.updates.on("message_new", async (ctx, next) => {
			if (ctx.isChat) {
				console.log("isChat");
				return;
			}
		});

		await this.vk.updates.start();
	}
}

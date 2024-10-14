import { config } from "dotenv";
import { BotVK } from "./BotVK.js";
config();

const vk = new BotVK();

vk.on("Привет", (ctx) => {
	ctx.reply("Bye!");
});

await vk.start();

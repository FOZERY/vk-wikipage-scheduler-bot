import { API } from 'vk-io';

export const vkUserApi = new API({
	token: process.env.USER_TOKEN ?? '',
});

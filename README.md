# bot-vk-node-ts

## Описание

Бот создан для редактирования wiki страниц в VK в качестве расписания.

Использовал следующие технологии:
- Node.js
- TypeScript
- VK-IO библиоетка для VK API
- Supabase
- DrizzleORM
- Pino + Logtail transport

### Config
```
NODE_ENV=development
LONGPOLL_TOKEN=token # longpoll vk bot token
USER_TOKEN=token # vk user token
GROUP_ID=group_id # group id with wiki page
PAGE_ID=page_id # wiki page id
DATABASE_URL=dburl # url of postgres db
LOGTAIL_TOKEN=logtailtoken # token for logtail
LOGTAIL_URL=logtailurl # url of logtail
LOG_TO_LOGTAIL=false # is need to log to logtail
PRETTY_LOGS=true # is need to use pino-pretty
```

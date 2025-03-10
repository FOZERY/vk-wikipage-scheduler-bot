import dayjs from "dayjs";
import "dayjs/locale/ru.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.locale("ru");
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const TZ_DEFAULT = "Europe/Moscow";
dayjs.tz.setDefault(TZ_DEFAULT);

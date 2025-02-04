import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.locale('ru');
dayjs.extend(customParseFormat);

import dayjs from "dayjs";
import { err, ok } from "neverthrow";
import { invalidFormatErr } from "../errors/index.js";
import { ViewTimeRange } from "../types/common.types.js";

export function parseTimeString(input: string) {
	const timeRangeRegex = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/;
	const singleTimeRegex = /^(\d{2}:\d{2})$/;

	let startTimeString, endTimeString: string | null;

	if (timeRangeRegex.test(input)) {
		// Если введен промежуток времени
		const [, rawStartTime, rawEndTime] = input.match(timeRangeRegex)!;

		const startTime = dayjs(rawStartTime, "HH:mm", true);
		const endTime = dayjs(rawEndTime, "HH:mm", true);

		if (!endTime.isValid() || !startTime.isValid()) {
			return err(invalidFormatErr(input, "HH:mm - HH:mm"));
		}

		if (startTime.diff(endTime) > 0) {
			return err(invalidFormatErr(input, "HH:mm - HH:mm"));
		}

		startTimeString = startTime.format("HH:mm:ss");
		endTimeString = endTime.format("HH:mm:ss");
	} else if (singleTimeRegex.test(input)) {
		// Если введено только время начала
		const [, rawStartTime] = input.match(singleTimeRegex)!;

		const startTime = dayjs(rawStartTime, "HH:mm", true);
		if (!startTime.isValid()) {
			return err(invalidFormatErr(rawStartTime, "HH:mm"));
		}

		startTimeString = startTime.format("HH:mm:ss");
		endTimeString = null;
	} else {
		return err(invalidFormatErr(input, "HH:mm - HH:mm"));
	}

	return ok({ startTimeString, endTimeString });
}

export function timeRangeToStringOutput(timeRange: ViewTimeRange): string {
	if (!timeRange) {
		return "-";
	}

	if (!timeRange.endTime) {
		return `${dayjs(timeRange.startTime, "HH:mm:ss").format("HH:mm")}`;
	}

	return `${dayjs(timeRange.startTime, "HH:mm:ss").format("HH:mm")} - ${dayjs(
		timeRange.endTime,
		"HH:mm:ss"
	).format("HH:mm")}`;
}

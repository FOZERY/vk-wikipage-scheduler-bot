import dayjs from "dayjs";
import { err, ok } from "neverthrow";
import { invalidFormatErr } from "../errors/index.js";
import type { ViewTimeRange } from "../types/common.types.js";

export function parseTimeString(input: string) {
	const timeRangeRegex = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/;
	const singleTimeRegex = /^(\d{2}:\d{2})$/;

	let startTimeString: string | null;
	let endTimeString: string | null;

	if (timeRangeRegex.test(input)) {
		// Если введен промежуток времени
		const match = input.match(timeRangeRegex);
		if (!match || match.length < 3) {
			return err(invalidFormatErr(input, "HH:mm - HH:mm"));
		}
		const [, rawStartTime, rawEndTime] = match;

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
		const match = input.match(singleTimeRegex);
		if (!match || match.length < 2) {
			return err(invalidFormatErr(input, "HH:mm"));
		}
		const [, rawStartTime] = match;

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

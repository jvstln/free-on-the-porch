import axios from "axios";

export function getErrorMessage(error: unknown): string {
	if (!error) return "";

	if (axios.isAxiosError(error)) {
		return error.response?.data?.message || error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	if (Array.isArray(error)) {
		for (const issue of error) {
			const message = getErrorMessage(issue);
			if (message) {
				return message;
			}
		}
		return "";
	}

	if (typeof error === "object" && error !== null) {
		const maybeError = error as { message?: unknown };
		if (typeof maybeError.message === "string") {
			return maybeError.message;
		}
	}

	return "null";
}

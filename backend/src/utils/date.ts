import dayjs from "dayjs";

export const isExpired = (date: Date) => dayjs(date).isBefore(dayjs());

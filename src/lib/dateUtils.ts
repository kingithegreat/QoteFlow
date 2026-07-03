import { format } from "date-fns";

export function formatDate(timestamp: number) {
  return format(new Date(timestamp), "MMM d, yyyy");
}

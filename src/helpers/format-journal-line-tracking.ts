import { TrackingCategory } from "xero-node";

export const formatJournalLineTracking = (
  tracking: TrackingCategory[],
): string => {
  return tracking
    .map((category) => `${category.name}: ${category.option}`)
    .join(", ");
};

import { TempRecord } from "../api/readRecentRecords";

export type DeviceStats = {
  deviceName: string;
  latestRecord: TempRecord;
  tempTrend: number; // degrees per minute
  humidityTrend: number; // percentage points per minute
};

export const getDeviceStats = (
  groupedRecords: TempRecord[][] = []
): DeviceStats[] => {
  return groupedRecords.map((deviceRecords) => {
    // Sort records by timestamp in descending order (most recent first)
    const sortedRecords = deviceRecords.sort(
      (a, b) => b.timestamp - a.timestamp
    );

    const latestRecord = sortedRecords[0];
    const oldestRecord = sortedRecords[sortedRecords.length - 1];

    // Calculate time difference in minutes
    const timeDiffMinutes =
      (latestRecord.timestamp - oldestRecord.timestamp) / (1000 * 60);

    // Calculate trends
    const tempTrend =
      timeDiffMinutes > 0
        ? (latestRecord.temperature - oldestRecord.temperature) / timeDiffMinutes
        : 0;

    const humidityTrend =
      timeDiffMinutes > 0
        ? (latestRecord.humidity - oldestRecord.humidity) / timeDiffMinutes
        : 0;

    return {
      deviceName: latestRecord.deviceName,
      latestRecord,
      tempTrend,
      humidityTrend,
    };
  });
};

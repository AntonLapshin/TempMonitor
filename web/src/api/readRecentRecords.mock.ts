import { TempRecord } from "./readRecentRecords";

const deviceNames = ["Living Room", "Bedroom", "Kitchen", "Office"];

function getRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const readRecentRecordsMock = async (): Promise<TempRecord[][]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, getRandomInt(500, 1500)));

  const now = Date.now();
  const thirtyMinutesAgo = now - 30 * 60 * 1000;

  const mockData: { [key: string]: TempRecord[] } = {};

  deviceNames.forEach((deviceName) => {
    const deviceRecords: TempRecord[] = [];
    let currentTime = thirtyMinutesAgo;

    while (currentTime <= now) {
      deviceRecords.push({
        deviceName,
        timestamp: currentTime,
        temperature: getRandomNumber(18, 28), // Temperature between 18°C and 28°C
        humidity: getRandomNumber(30, 70), // Humidity between 30% and 70%
      });

      // Add a random time increment between 1 and 5 minutes
      currentTime += getRandomInt(1, 5) * 60 * 1000;
    }

    mockData[deviceName] = deviceRecords;
  });

  // Convert the mockData object to a 2D array
  return Object.values(mockData);
};

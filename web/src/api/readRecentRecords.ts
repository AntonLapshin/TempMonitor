import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";
import CdkOutputs from "../cdk-outputs.json";

export type TempRecord = {
  name: string; // device name
  timestamp: number;
  temp: number;
  humidity: number;
};

const PAST_INTERVAL = 30 * 60 * 1000;

export const readRecentRecords = async (): Promise<TempRecord[][]> => {
  const session = await fetchAuthSession();
  const { credentials, identityId } = session;

  const client = new DynamoDBClient({
    credentials,
    region: CdkOutputs.TempMonitorStack.Region,
  });
  const docClient = DynamoDBDocumentClient.from(client);

  const pastInterval = Date.now() - PAST_INTERVAL;

  const command = new QueryCommand({
    TableName: CdkOutputs.TempMonitorStack.DynamoDBTableName,
    KeyConditionExpression: "userId = :userId AND #timestamp > :timestamp",
    ExpressionAttributeNames: {
      "#timestamp": "timestamp",
    },
    ExpressionAttributeValues: {
      ":userId": identityId,
      ":timestamp": pastInterval,
    },
    ProjectionExpression: "name, #timestamp, temp, humidity",
    ScanIndexForward: false, // to get the most recent records first
  });

  const response = await docClient.send(command);

  const records: TempRecord[] = response.Items as TempRecord[] || [];

  // Group records by device name
  const groupedRecords: { [key: string]: TempRecord[] } = {};
  records.forEach((record) => {
    if (!groupedRecords[record.name]) {
      groupedRecords[record.name] = [];
    }
    groupedRecords[record.name].push(record);
  });

  // Convert the grouped records object to a 2D array
  return Object.values(groupedRecords);
};
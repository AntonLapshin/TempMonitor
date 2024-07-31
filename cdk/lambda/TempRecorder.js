const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    const { userId, name, temp, humidity } = body;

    // Validate input
    if (
      !userId ||
      name === undefined ||
      temp === undefined ||
      humidity === undefined
    ) {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          error: "Missing required fields: userId, name, temp, or humidity",
        }),
      };
    }

    // Prepare the item to be inserted into DynamoDB
    const item = {
      userId: userId,
      name,
      timestamp: Date.now(), // Use current timestamp as sort key
      temp,
      humidity,
    };

    const command = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: item,
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({ message: "Data recorded successfully", item }),
    };
  } catch (error) {
    console.error("Error recording data:", error);
    return {
      statusCode: 500,
      headers: getHeaders(),
      body: JSON.stringify({ error: `Error recording data: ${error.message}` }),
    };
  }
};

function getHeaders() {
  return {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST",
  };
}

import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export const createDynamoDb = (
  stack: cdk.Stack,
  userRole: cdk.aws_iam.Role
) => {
  const table = new dynamodb.Table(stack, "TempSnapshots", {
    partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
    sortKey: { name: "timestamp", type: dynamodb.AttributeType.NUMBER },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  });

  userRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ["dynamodb:Query", "dynamodb:PutItem"],
      resources: [table.tableArn],
      effect: iam.Effect.ALLOW,
      conditions: {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"],
        },
      },
    })
  );

  new cdk.CfnOutput(stack, "DynamoDBTableName", {
    value: table.tableName,
  });

  return table;
};

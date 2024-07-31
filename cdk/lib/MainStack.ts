import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Duration } from "aws-cdk-lib";
import { createCognito } from "./createCognito";
import { createDynamoDb } from "./createDynamoDb";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const envPath = path.join(__dirname, "..", "lambda", ".env");
    const envConfig = dotenv.parse(fs.readFileSync(envPath));

    if (!envConfig.ALLOWED_ORIGIN) {
      throw "No ALLOWED_ORIGIN is set";
    }

    if (!envConfig.API_KEY) {
      throw "No API_KEY is set";
    }

    const { userRole } = createCognito(this);
    const table = createDynamoDb(this, userRole);

    const lambdaTempRecorder = new lambda.Function(this, "TempRecorder", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "TempRecorder.handler",
      environment: {
        ...envConfig,
        TABLE_NAME: table.tableName,
      },
    });

    table.grantWriteData(lambdaTempRecorder);

    const apiKey = new apigateway.ApiKey(this, "TempRecorderApiKey", {
      apiKeyName: "temp-recorder-api-key",
      value: envConfig.API_KEY,
    });

    const tempRecorderApi = new apigateway.LambdaRestApi(
      this,
      "TempRecorderApi",
      {
        handler: lambdaTempRecorder,
        cloudWatchRole: true,
        proxy: false,
        deployOptions: {
          loggingLevel: apigateway.MethodLoggingLevel.INFO,
          dataTraceEnabled: true,
          metricsEnabled: true,
        },
        defaultCorsPreflightOptions: {
          // window.location.origin => no trailing slash is allowed
          allowOrigins: [envConfig.ALLOWED_ORIGIN],
          allowMethods: apigateway.Cors.ALL_METHODS,
          allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        },
        integrationOptions: {
          timeout: Duration.seconds(5),
        },
      }
    );

    new cdk.CfnOutput(this, "TempRecorderApiURL", {
      value: tempRecorderApi.url,
    });

    const usagePlan = new apigateway.UsagePlan(this, "TempRecorderUsagePlan", {
      name: "TempRecorderUsagePlan",
      apiStages: [
        {
          api: tempRecorderApi,
          stage: tempRecorderApi.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    const snapshotResource = tempRecorderApi.root.addResource("snapshot");
    snapshotResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaTempRecorder),
      {
        apiKeyRequired: true,
        requestParameters: {
          "method.request.header.Content-Type": true,
        },
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
            },
          },
        ],
      }
    );
  }
}

import CdkOutputs from "./cdk-outputs.json";

export const awsExports = {
  Auth: {
    Cognito: {
      userPoolId: CdkOutputs.TempMonitorStack.UserPoolId,
      userPoolClientId: CdkOutputs.TempMonitorStack.UserPoolClientId,
      identityPoolId: CdkOutputs.TempMonitorStack.IdentityPoolId,
      loginWith: {
        oauth: {
          domain: CdkOutputs.TempMonitorStack.UserPoolDomain,
          scopes: ["email", "profile", "openid", "aws.cognito.signin.user.admin"],
          redirectSignIn: [
            CdkOutputs.TempMonitorStack.WebOriginLocal,
            CdkOutputs.TempMonitorStack.WebOrigin,
          ],
          redirectSignOut: [
            CdkOutputs.TempMonitorStack.WebOriginLocal,
            CdkOutputs.TempMonitorStack.WebOrigin,
          ],
          responseType: "code", // or 'token' for implicit flow
        },
      },
    },
  },
  API: {
    REST: {
      Bluey: {
        endpoint: CdkOutputs.TempMonitorStack.TempRecorderApiEndpoint9A28982F,
        region: CdkOutputs.TempMonitorStack.Region,
      },
    },
  },
};

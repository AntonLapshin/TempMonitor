import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";

export const createCognito = (stack: cdk.Stack) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth Credentials are not set");
  }

  if (!process.env.WEB_ORIGIN || !process.env.WEB_ORIGIN_LOCAL) {
    throw new Error("Origin URL is not set");
  }

  if (!process.env.COGNITO_DOMAIN_PREFIX) {
    throw new Error("Cognito domain prefix is not set");
  }

  const userPool = new cognito.UserPool(stack, "UserPool", {});

  const uniquePrefix = process.env.COGNITO_DOMAIN_PREFIX;

  const userPoolDomain = userPool.addDomain("default", {
    cognitoDomain: {
      domainPrefix: uniquePrefix,
    },
  });

  const userPoolClient = new cognito.UserPoolClient(stack, "UserPoolClient", {
    userPool,
    generateSecret: false,
    supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.GOOGLE],
    oAuth: {
      callbackUrls: [process.env.WEB_ORIGIN_LOCAL, process.env.WEB_ORIGIN],
      logoutUrls: [process.env.WEB_ORIGIN_LOCAL, process.env.WEB_ORIGIN],
      flows: {
        authorizationCodeGrant: true,
      },
      // scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
    },
  });

  const identityPool = new cognito.CfnIdentityPool(stack, "IdentityPool", {
    allowUnauthenticatedIdentities: false,
    cognitoIdentityProviders: [
      {
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName,
      },
    ],
  });

  new cognito.UserPoolIdentityProviderGoogle(stack, "Google", {
    userPool,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    scopes: ["profile", "email", "openid"],
    attributeMapping: {
      email: cognito.ProviderAttribute.GOOGLE_EMAIL,
      givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
      familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
    },
  });

  userPoolClient.node.addDependency(userPool);
  userPoolClient.node.addDependency(userPool.identityProviders[0]);

  const userRole = new iam.Role(stack, "UserRole", {
    assumedBy: new iam.FederatedPrincipal(
      "cognito-identity.amazonaws.com",
      {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": identityPool.ref,
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated",
        },
      },
      "sts:AssumeRoleWithWebIdentity"
    ),
  });

  new cognito.CfnIdentityPoolRoleAttachment(
    stack,
    "IdentityPoolRoleAttachment",
    {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: userRole.roleArn,
      },
    }
  );

  new cdk.CfnOutput(stack, "Region", { value: stack.region });
  new cdk.CfnOutput(stack, "WebOrigin", { value: process.env.WEB_ORIGIN });
  new cdk.CfnOutput(stack, "WebOriginLocal", {
    value: process.env.WEB_ORIGIN_LOCAL,
  });
  new cdk.CfnOutput(stack, "UserPoolId", { value: userPool.userPoolId });
  new cdk.CfnOutput(stack, "UserPoolClientId", {
    value: userPoolClient.userPoolClientId,
  });
  new cdk.CfnOutput(stack, "IdentityPoolId", { value: identityPool.ref });
  new cdk.CfnOutput(stack, "UserPoolDomain", {
    value: `${userPoolDomain.domainName}.auth.${stack.region}.amazoncognito.com`,
  });

  return {
    userPool,
    identityPool,
    userRole
  };
};

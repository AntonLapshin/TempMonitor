import {
  withAuthenticator,
  WithAuthenticatorProps,
} from "@aws-amplify/ui-react";
import { styled } from "./stitches.config";
import { Flex } from "./components/Primitives";
import { Dashboard } from "./Dashboard";

const AppContainer = styled(Flex, {
  width: "100dvw",
  height: "100dvh",
  justifyContent: "center",
  padding: "1rem",
  "@bp1": {
    padding: "2rem",
  },
});

function __App({}: WithAuthenticatorProps) {
  // const email = useEmail();

  return (
    <AppContainer>
      <Dashboard />
    </AppContainer>
  );
}

export const App = withAuthenticator(__App, {
  socialProviders: ["google"],
});

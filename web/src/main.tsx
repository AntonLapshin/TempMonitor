import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "normalize.css";
import "./fonts.css";
import "./index.css";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { awsExports } from "./awsExports.ts";

Amplify.configure(awsExports as any);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

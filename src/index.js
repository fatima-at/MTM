import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SoftUIControllerProvider } from "context";

// ADD THESE TWO LINES:
import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/theme/index";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <SoftUIControllerProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </SoftUIControllerProvider>
  </BrowserRouter>
);
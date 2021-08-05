import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";
import Editor from "./Editor";

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider theme={theme}>
      <Editor />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

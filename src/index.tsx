import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import Editor from "./Editor";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false
  }
});

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode="dark" />
    <ChakraProvider theme={theme}>
      <Editor />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

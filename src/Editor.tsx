import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Textarea,
  VStack
} from "@chakra-ui/react";
import * as babel from "@babel/standalone";
import * as pegase from "pegase";
import ColorModeSwitcher from "./ColorModeSwitcher";

export default function Editor() {
  const [demo, setDemo] = useState(sampleCode);
  const [input, setInput] = useState("2 + (17-2*30) *(-5)+2");
  const [code, setCode] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const outputBuffer = useRef<Array<Array<any>>>([]);

  useEffect(() => {
    patchWindow("_pegase_input", "");

    patchWindow("_pegase_require", (module: string) => {
      if (module === "pegase") return pegase;
      throw new Error("You can only use the pegase module in this demo");
    });

    patchWindow("_pegase_console", {
      log(...args: Array<any>) {
        outputBuffer.current.push(args);
      }
    });
  }, []);

  useEffect(() => {
    try {
      setCode(`
        var input = window._pegase_input;
        var require = window._pegase_require;
        var console = window._pegase_console;
        ${babel.transform(demo, { presets: ["env"] }).code ?? ""}
      `);
    } catch (error) {
      setCode(null);
      setOutput(`[Babel error] ${error.message}`);
    }
  }, [demo]);

  useEffect(() => {
    if (code) {
      patchWindow("_pegase_input", input);
      outputBuffer.current = [];
      try {
        new Function(code)();
        setOutput(
          outputBuffer.current.map(chunk => chunk.join(" ")).join("\n")
        );
      } catch (error) {
        setOutput(`[Runtime Error] ${error.message}`);
      }
    }
  }, [input, code]);

  return (
    <Box fontSize="md">
      <Grid
        h="100vh"
        p={3}
        gap={4}
        templateRows="repeat(3, 1fr)"
        templateColumns="repeat(2, 1fr)"
      >
        <GridItem rowSpan={3} colSpan={1} p={4}>
          <VStack h="100%">
            <Heading>Code</Heading>
            <Textarea
              flexGrow={1}
              placeholder="Type some code using pegase"
              fontFamily='"Fira code", "Fira Mono", monospace'
              value={demo}
              onChange={e => setDemo(e.target.value)}
            />
          </VStack>
        </GridItem>
        <GridItem rowSpan={2} colSpan={1} p={4}>
          <VStack h="100%" alignItems="left">
            <Heading>
              <code>const input = `</code>
            </Heading>
            <Textarea
              flexGrow={1}
              placeholder="Type your input"
              fontFamily='"Fira code", "Fira Mono", monospace'
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <Heading>
              <code>`;</code>
            </Heading>
          </VStack>
          <ColorModeSwitcher position="absolute" top={0} right={0} />
        </GridItem>
        <GridItem rowSpan={1} colSpan={1} p={4}>
          <VStack h="100%">
            <Heading>console.log</Heading>
            <Textarea
              readOnly
              flexGrow={1}
              fontFamily='"Fira code", "Fira Mono", monospace'
              value={output}
            />
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

function patchWindow(key: string, value: any) {
  (window as any)[key] = value;
}

const sampleCode = `import peg from "pegase";

function calc(left, op, right) {
  switch (op) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return left / right;
  }
}

const g = peg\`
  expr: term % ("+" | "-") @infix(\${calc})
  term: fact % ("*" | "/") @infix(\${calc})
  fact: num | '(' expr ')'
  num @token("integer"):
    '-'? [0-9]+ @number
\`;

const result = g.parse(input);

result.success ?
  console.log(result.value)
: console.log(result.logs());`;

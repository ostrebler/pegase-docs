import React, { useEffect, useRef, useState } from "react";
import {
  chakra,
  Grid,
  GridItem,
  Heading,
  shouldForwardProp,
  Textarea,
  VStack
} from "@chakra-ui/react";
import * as babel from "@babel/standalone";
import inspect from "object-inspect";
import * as pegase from "pegase";
import CodeEditor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-dark.css";
import ColorModeSwitcher from "./ColorModeSwitcher";
import theme from "./theme";

export default function Editor() {
  const [code, setCode] = useState(sampleCode);
  const [input, setInput] = useState("2 + (17.-2*30) *(-5)+ 2.56");
  const [transpile, setTranspile] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const outputBuffer = useRef<Array<Array<any>>>([]);

  useEffect(() => {
    patchWindow("_pegase_input", "");

    patchWindow("_pegase_require", (module: string) => {
      if (module === "pegase") return pegase;
      throw new Error("You can only use the pegase module in this demo");
    });

    patchWindow("_pegase_console", {
      ...console,
      log(...args: Array<any>) {
        console.log(...args);
        outputBuffer.current.push(args);
      }
    });
  }, []);

  useEffect(() => {
    try {
      setTranspile(`
        var input = window._pegase_input;
        var require = window._pegase_require;
        var console = window._pegase_console;
        ${babel.transform(code, { presets: ["env"] }).code ?? ""}
      `);
    } catch (error) {
      setTranspile(null);
      setOutput(`[Babel Error] ${error.message}`);
    }
  }, [code]);

  useEffect(() => {
    if (transpile) {
      patchWindow("_pegase_input", input);
      outputBuffer.current = [];
      try {
        new Function(transpile)(); // eslint-disable-line
        setOutput(
          outputBuffer.current
            .map(chunk => chunk.map(consolify).join(" "))
            .join("\n")
        );
      } catch (error) {
        setOutput(`[Runtime Error] ${error.message}`);
      }
    }
  }, [input, transpile]);

  return (
    <Grid
      h="100vh"
      p={3}
      fontSize="md"
      gap={4}
      templateRows="repeat(2, 1fr)"
      templateColumns="repeat(2, 1fr)"
    >
      <GridItem rowSpan={2} colSpan={1} p={4}>
        <VStack h="100%">
          <Heading>Editable code</Heading>
          <BasicCodeEditor
            value={code}
            onValueChange={setCode}
            flexGrow={1}
            width="100%"
            placeholder="Type some code using pegase"
            padding={theme.space["4"]}
            highlight={code =>
              prism.highlight(code, prism.languages.javascript, "javascript")
            }
          />
        </VStack>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1} p={4}>
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
  );
}

const BasicCodeEditor = chakra(CodeEditor, {
  shouldForwardProp: prop => prop === "padding" || shouldForwardProp(prop),
  baseStyle: {
    fontFamily: '"Fira code", "Fira Mono", monospace',
    "> textarea": {
      outline: "none",
      borderRadius: theme.radii.lg
    }
  }
});

function patchWindow(key: string, value: any) {
  (window as any)[key] = value;
}

function consolify(value: any) {
  if (typeof value === "string") return value;
  return inspect(value, { indent: 2 });
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
    '-'? [0-9]+ ('.' [0-9]*)? @number
\`;

const result = g.parse(input);

result.success ?
  console.log(result.value)
: console.log(result.logs());`;

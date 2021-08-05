import React from "react";
import {
  IconButton,
  IconButtonProps,
  useColorMode,
  useColorModeValue
} from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ColorModeSwitcher(
  props: Omit<IconButtonProps, "aria-label">
) {
  const { toggleColorMode } = useColorMode();
  const text = useColorModeValue("dark", "light");
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);
  return (
    <IconButton
      size="md"
      fontSize="lg"
      variant="ghost"
      color="current"
      marginLeft="2"
      onClick={toggleColorMode}
      icon={<SwitchIcon />}
      aria-label={`Switch to ${text} mode`}
      {...props}
    />
  );
}

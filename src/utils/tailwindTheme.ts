import tailwindConfig from "../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import { ScreensConfig } from "tailwindcss/types/config";

const config = resolveConfig(tailwindConfig);
const theme = config.theme;

const screenSizes = {
  "2xl": "1536px",
  lg: "1024px",
  md: "768px",
  sm: "640px",
  xl: "1280px",
  xs: "430px"
} as ScreensConfig;
if (theme?.screens !== undefined) {
  theme.screen = screenSizes;
}

export default theme;

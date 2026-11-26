import { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  future: {
    hoverOnlyWhenSupported: true
  },
  plugins: [
    require("tailwindcss-animate"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("tailwind-scrollbar")({ nocompatible: true })
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem"
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        "primary-purple": "rgb(var(--primary-purple), <alpha-value>)",
        "medium-purple": "rgb(var(--medium-purple), <alpha-value>)",
        "light-purple": "rgb(var(--light-purple), <alpha-value>)",
        black: "rgb(var(--black), <alpha-value>)",
        "dark-gray": "rgb(var(--dark-gray), <alpha-value>)",
        green: "rgb(var(--green), <alpha-value>)",
        red: "rgb(var(--red), <alpha-value>)",
        yellow: "rgb(var(--yellow), <alpha-value>)",
        "light-gray": "rgb(var(--light-gray), <alpha-value>)",
        "light-gray-2": "rgb(var(--light-gray-2), <alpha-value>)",
        "off-white": "rgb(var(--off-white), <alpha-value>)",
        white: "rgb(var(--white), <alpha-value>)",

        accent: {
          dark: "rgb(var(--accent-dark), <alpha-value>)",
          DEFAULT: "rgb(var(--accent), <alpha-value>)",
          light: "rgb(var(--accent-light), <alpha-value>)"
        },
        background: "rgb(var(--background), <alpha-value>)",
        border: "rgb(var(--border), <alpha-value>)",
        failure: {
          DEFAULT: "rgb(var(--red), <alpha-value>)",
          foreground: "rgb(var(--failure-foreground), <alpha-value>)",
          light: "rgb(var(--failure-light), <alpha-value>)"
        },
        foreground: "rgb(var(--foreground), <alpha-value>)",
        input: "rgb(var(--off-white), <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted), <alpha-value>)",
          foreground: "rgb(var(--muted-foreground), <alpha-value>)"
        },
        popover: {
          DEFAULT: "rgb(var(--popover), <alpha-value>)",
          foreground: "rgb(var(--popover-foreground), <alpha-value>)"
        },
        primary: {
          dark: "rgb(var(--primary-dark), <alpha-value>)",
          "dark-hover": "rgb(var(--primary-dark-hover), <alpha-value>)",
          DEFAULT: "rgb(var(--primary-purple), <alpha-value>)",
          foreground: "rgb(var(--primary-foreground), <alpha-value>)",
          hover: "rgb(var(--primary-hover), <alpha-value>)",
          light: "rgb(var(--primary-light), <alpha-value>)"
        },
        ring: "rgb(var(--ring), <alpha-value>)",
        secondary: {
          DEFAULT: "rgb(var(--secondary), <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground), <alpha-value>)",
          light: "rgb(var(--secondary-light), <alpha-value>)"
        },
        success: {
          DEFAULT: "rgb(var(--green), <alpha-value>)",
          foreground: "rgb(var(--success-foreground), <alpha-value>)",
          light: "rgb(var(--success-light), <alpha-value>)"
        },
        text: {
          DEFAULT: "rgb(var(--black), <alpha-value>)",
          light: "rgb(var(--dark-gray), <alpha-value>)"
        }
      },
      // Type scale. Weights: 400 for everything, 500 only for titles (and the hovered grid time label).
      // xs and sm are intentionally larger than Tailwind's defaults (12px / 14px).
      fontSize: {
        // micro: "+1" superscripts and initials in small avatars only
        "3xs": ["0.6rem", { lineHeight: "0.75rem" }],
        // caption: grid time labels, participant chips, grid time zone chip
        "2xs": ["0.7rem", { lineHeight: "1rem" }],
        // label: form labels, helper and empty-state text, field errors, response count, mini calendar
        xs: ["0.8rem", { lineHeight: "1.125rem" }],
        // body: buttons, inputs from sm up, dropdown rows, toasts, dialog descriptions, dates
        sm: ["0.9rem", { lineHeight: "1.25rem" }],
        // text inputs below sm only (16px stops iOS zooming in on focus)
        base: ["1rem", { lineHeight: "1.5rem" }],
        // title (500): event name, dialog titles, calendar month titles, error page title
        lg: ["1.125rem", { lineHeight: "1.5rem" }],
        // display: the large create-page calendar and day-of-week labels
        "2xl": ["1.5rem", { lineHeight: "2rem" }]
      }
    },
    screens: {
      xs: "430px",
      ...defaultTheme.screens
    }
  }
} as Config;

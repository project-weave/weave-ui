/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")({ nocompatible: true })],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        accent: {
          dark: "rgb(var(--accent-dark), <alpha-value>)",
          DEFAULT: "rgb(var(--accent), <alpha-value>)",
          light: "rgb(var(--accent-light), <alpha-value>)"
        },
        background: "rgb(var(--background), <alpha-value>)",
        border: "rgb(var(--border), <alpha-value>)",
        failure: {
          DEFAULT: "rgb(var(--failure), <alpha-value>)",
          foreground: "rgb(var(--failure-foreground), <alpha-value>)"
        },
        foreground: "rgb(var(--foreground), <alpha-value>)",
        input: "rgb(var(--input), <alpha-value>)",
        primary: {
          dark: "rgb(var(--primary-dark), <alpha-value>)",
          "dark-hover": "rgb(var(--primary-dark-hover), <alpha-value>)",
          DEFAULT: "rgb(var(--primary), <alpha-value>)",
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
          DEFAULT: "rgb(var(--success), <alpha-value>)",
          foreground: "rgb(var(--success-foreground), <alpha-value>)"
        },
        text: {
          DEFAULT: "rgb(var(--text), <alpha-value>)",
          light: "rgb(var(--text-light), <alpha-value>)"
        }
      },
      fontSize: {
        "2xs": "0.7rem",
        "3xs": "0.65rem",
        "4xs": "0.6rem"
      }
      // keyframes: {
      //   "accordion-down": {
      //     from: { height: 0 },
      //     to: { height: "var(--radix-accordion-content-height)" }
      //   },
      //   "accordion-up": {
      //     from: { height: "var(--radix-accordion-content-height)" },
      //     to: { height: 0 }
      //   }
      // },
      // animation: {
      //   "accordion-down": "accordion-down 0.2s ease-out",
      //   "accordion-up": "accordion-up 0.2s ease-out"
      // }
    }
  }
};

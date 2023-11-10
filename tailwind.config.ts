/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "rgb(var(--border), <alpha-value>)",
        input: "rgb(var(--input), <alpha-value>)",
        ring: "rgb(var(--ring), <alpha-value>)",
        background: "rgb(var(--background), <alpha-value>)",
        foreground: "rgb(var(--foreground), <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary), <alpha-value>)",
          foreground: "rgb(var(--primary-foreground), <alpha-value>)",
          light: "rgb(var(--primary-light), <alpha-value>)"
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary), <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground), <alpha-value>)",
          light: "rgb(var(--secondary-light), <alpha-value>)"
        },
        text: {
          DEFAULT: "rgb(var(--text), <alpha-value>)",
          light: "rgb(var(--text-light), <alpha-value>)"
        }
      },
      gridTemplateColumns: {
        "availability-grid": "5rem 1fr"
      },
      gridTemplateRows: {
        "availability-grid": "auto 1fr"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
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
  },
  plugins: [require("tailwindcss-animate")]
};

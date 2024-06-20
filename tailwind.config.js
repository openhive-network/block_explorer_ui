/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["media","class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "explorer-dark-gray": "#292F3D",
        "explorer-yellow": "#FFF351",
        "explorer-ligh-blue": "#6AF5FF",
        "explorer-dark-blue": "#160855",
        "explorer-blue": "#0041F3",
        "explorer-turquoise": "#00D9FF",
        "explorer-red": "#FF0000",
        "explorer-orange": "#FFAC33",
        "explorer-ligh-green": "#64FFAA",
        "explorer-ligh-gray": "#ADA9A9DC",
        "explorer-bg-start": "rgb(214, 219, 220)",
        "switch-off": "rgb(200, 200, 200)",
        "switch-on": "rgb(100, 100, 100)",
        "switch-button": "rgb(20, 20, 20)",
        "blocked": "rgba(255, 255, 255, 0.7)",
        "explorer-posting-operations": "#ffbe0b",
        "explorer-curation-operations": "#fb5607",
        "explorer-transfer-operations": "#8338ec",
        "explorer-market-operations": "#FF69B4",
        "explorer-vesting-operations": "#780028",
        "explorer-account-management-operations": "#b010bf",
        "explorer-witness-management-operations": "#008080",
        "explorer-witness-voting-operations": "#008050",
        "explorer-proposal-operations": "#78c814",
        "explorer-custom-operations": "#80003e",
        "explorer-other-operations": "#3a86ff",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "rgba(255, 255, 255, 0.5)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      flex: {
        "2": "2 2 0%",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
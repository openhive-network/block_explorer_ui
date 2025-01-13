/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      // Modify colors @styles/theme.css
      colors: {
        theme: "var(--color-background)",
        rowOdd: "var(--color-row-odd)",
        rowEven: "var(--color-row-even)",
        rowHover: "var(--color-row-hover)",
        buttonBg: "var(--color-button)",
        buttonText: "var(--color-button-text)",
        buttonHover: "var(--color-button-hover)",
        text: "var(--color-text)",
        link: "var(--color-link)",
        operationPerspectiveIncoming:
          "var(--color-operation-perspective-incoming)",

        switch: {
          button: "var(--color-switch-button)",
          off: "var(--color-switch-off)",
          on: "var(--color-switch-on)",
        },
        blocked: "var(--color-blocked)",
        "explorer-operations": {
          "account-management": "var(--color-operation-account-management)",
          "witness-management": "var(--color-operation-witness-management)",
          "witness-voting": "var(--color-operation-witness-voting)",
          posting: "var( --color-operation-posting)",
          curation: "var(--color-operation-curation)",
          transfer: "var(--color-operation-transfer)",
          market: "var( --color-operation-market)",
          vesting: "var(--color-operation-vesting)",
          proposal: "var(--color-operation-proposal)",
          custom: "var(--color-operation-custom)",
          other: "var(--color-operation-other)",
        },
        "explorer-bg-start": "var(--background-start-rgb)",
        "explorer-yellow": "var(--color-yellow)",
        "explorer-light-blue": "var(--color-light-blue)",
        "explorer-dark-blue": "var(--color-dark-blue)",
        "explorer-blue": "var(--color-blue)",
        "explorer-turquoise": "var(--color-turquoise)",
        "explorer-red": "var(--color-red)",
        "explorer-orange": "var(--color-orange)",
        "explorer-light-green": "var(--color-light-green)",
        "explorer-light-gray": "var(--color-light-gray)",
        "explorer-dark-gray": "var(--color-dark-gray)",
        "explorer-extra-light-gray": "var(--color-extra-light-gray)",
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

        navbar: {
          DEFAULT: "var(--color-navbar-icon)",
          hover: "var(--color-navbar-icon-hover)",
          border: "var(--color-navbar-icon-border)",
          listHover: "var(--color-navbar-icon-list-hover)",
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
        2: "2 2 0%",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

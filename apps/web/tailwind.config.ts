import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
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
        // Material Design 3 color system
        primary: {
          DEFAULT: "#9d4300",
          container: "#f97316",
          fixed: "#ffdbca",
          "fixed-dim": "#ffb690",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#582200",
          fixed: "#341100",
          "fixed-variant": "#783200",
        },
        secondary: {
          DEFAULT: "#b4136d",
          container: "#fd56a7",
          fixed: "#ffd9e4",
          "fixed-dim": "#ffb0cd",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#600037",
          fixed: "#3e0022",
          "fixed-variant": "#8c0053",
        },
        tertiary: {
          DEFAULT: "#855300",
          container: "#d78900",
          fixed: "#ffddb8",
          "fixed-dim": "#ffb95f",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#492c00",
          fixed: "#2a1700",
          "fixed-variant": "#653e00",
        },
        error: { DEFAULT: "#ba1a1a", container: "#ffdad6" },
        "on-error": { DEFAULT: "#ffffff", container: "#93000a" },
        surface: {
          DEFAULT: "#f9f9f8",
          "container-lowest": "#ffffff",
          "container-low": "#f3f4f3",
          container: "#eeeeed",
          "container-high": "#e8e8e7",
          "container-highest": "#e2e2e2",
        },
        "on-surface": { DEFAULT: "#1a1c1c", variant: "#584237" },
        outline: { DEFAULT: "#8c7164", variant: "#e0c0b1" },
        inverse: {
          surface: "#2f3130",
          "on-surface": "#f1f1f0",
          primary: "#ffb690",
        },
        "nav-dark": "#3E2723",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scroll-left": "scroll-left 30s linear infinite",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        headline: [
          "var(--font-plus-jakarta-sans)",
          '"Plus Jakarta Sans"',
          "sans-serif",
        ],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        label: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

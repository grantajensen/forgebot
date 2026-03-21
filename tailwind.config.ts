import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        forge: {
          DEFAULT: "hsl(var(--forge))",
          foreground: "hsl(var(--forge-foreground))",
          muted: "hsl(var(--forge-muted))",
        },
        landing: {
          void: "hsl(var(--landing-void))",
          metal: "hsl(var(--landing-metal))",
          deep: "hsl(var(--landing-deep))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          well: "hsl(var(--cream-well))",
          warm: "hsl(var(--cream-warm))",
          card: "hsl(var(--cream-card))",
        },
        olive: {
          DEFAULT: "hsl(var(--olive))",
          deep: "hsl(var(--olive-deep))",
          foreground: "hsl(var(--olive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        brand: ["var(--font-brand-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

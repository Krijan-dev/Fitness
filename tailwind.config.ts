import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-muted": "var(--background-muted)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        "surface-hover": "var(--surface-hover)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        "text-muted": "var(--text-muted)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
          soft: "var(--primary-soft)",
          "soft-foreground": "var(--primary-soft-foreground)",
        },
        "primary-hover": "var(--primary-hover)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        success: "var(--success)",
        warning: "var(--warning)",
        ring: "var(--ring)",
        sidebar: "var(--sidebar)",
        /* Fresh Minimal brand accents for store badges */
        store: {
          woolworths: "#059669",
          coles: "#9f1239",
          aldi: "#1d4ed8",
          iga: "#b91c1c",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        glow:
          "0 0 0 1px color-mix(in srgb, var(--primary) 28%, transparent), 0 0 24px var(--glow)",
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        "emerald-ring":
          "0 0 0 2px color-mix(in srgb, #059669 35%, transparent), 0 8px 24px -12px rgba(5, 150, 105, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;

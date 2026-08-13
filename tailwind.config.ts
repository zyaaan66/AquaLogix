import type { Config } from "tailwindcss";

// AquaLogix Design System
// Rationale: "Dark Premium" theme evoking ocean depth for a fisheries supply-chain
// product. The primary navy (#0F172A) is the base "deep water" surface; the accent
// sky blue (#0EA5E9) is the single bright signal color used sparingly for actions,
// live data, and the signature depth-gradient motif used across cards and charts.
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F172A", // deep water — base dark surface
          50: "#F1F5F9",
          100: "#E2E8F0",
          400: "#334155",
          600: "#1E293B",
          900: "#0F172A",
          950: "#080D1A",
        },
        secondary: {
          DEFAULT: "#F8FAFC", // surface / light mode base
        },
        accent: {
          DEFAULT: "#0EA5E9", // signal blue — actions, live data, focus
          light: "#38BDF8",
          dark: "#0284C7",
        },
        danger: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "16px",
        sm: "10px",
        lg: "20px",
        xl: "28px",
      },
      spacing: {
        0.5: "4px",
        1: "8px",
        1.5: "12px",
        2: "16px",
        3: "24px",
        4: "32px",
        5: "40px",
        6: "48px",
        8: "64px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(2, 6, 23, 0.37)",
        "glow-accent": "0 0 24px 0 rgba(14, 165, 233, 0.25)",
        card: "0 1px 2px 0 rgba(0,0,0,0.06), 0 4px 16px -4px rgba(2,6,23,0.35)",
      },
      backgroundImage: {
        "depth-gradient":
          "linear-gradient(180deg, rgba(14,165,233,0.12) 0%, rgba(15,23,42,0) 60%)",
        "sonar-radial":
          "radial-gradient(circle at 50% 0%, rgba(14,165,233,0.18), transparent 70%)",
      },
      transitionTimingFunction: {
        cubic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "wave-pulse": {
          "0%, 100%": { transform: "scaleY(1)", opacity: "0.6" },
          "50%": { transform: "scaleY(1.6)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        "fade-up": "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "wave-pulse": "wave-pulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

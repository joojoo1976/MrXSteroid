import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
        "./hooks/**/*.{ts,tsx}",
        "./shared/**/*.{ts,tsx}",
        "./context/**/*.{ts,tsx}",
        "./features/**/*.{ts,tsx}",
        "./i18n/**/*.{ts,tsx}",
        "./data/**/*.{ts,tsx}",
        "./config/**/*.{ts,tsx}",
        "./utils/**/*.{ts,tsx}",
        "./legacy-pages/**/*.{ts,tsx}",
    ],
    prefix: "",
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
                gold: {
                    400: "hsl(var(--gold-400))",
                    500: "hsl(var(--gold-500))",
                    600: "hsl(var(--gold-600))"
                }
            },
            fontFamily: {
                chiller: ["ChillerBrand", "cursive", "system-ui"],
                sans: ["Inter", "Cairo", "Tajawal", "system-ui", "sans-serif"],
                arabic: ["Cairo", "Tajawal", "system-ui", "sans-serif"],
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
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(234, 179, 8, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(234, 179, 8, 0.5)' },
                },
                "bounce-slow": {
                    '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
                    '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "glow": "glow 3s ease-in-out infinite",
                "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "bounce-slow": "bounce-slow 3s infinite",
                fadeIn: "fadeIn 0.3s ease-out forwards",
                slideUp: "slideUp 0.4s ease-out forwards",
                pulseSoft: "pulseSoft 2s infinite ease-in-out",
            },
        },
    },
    plugins: [tailwindcssAnimate],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ink = page/surface background, bone = main text.
        // (Named from the old dark theme — kept the names, flipped the values,
        // so most existing bg-ink / text-bone classes still make sense.)
        ink: "#FAFAF8",
        bone: "#171519",
        rust: "#B5502C",
        moss: "#3A4A3A",
        // Accent colors darkened vs. the old dark-theme versions — the
        // original light tints (built for a black background) don't have
        // enough contrast to read as text or icons on white.
        electric: "#4F46E5",
        acid: "#65A30D",
        coral: "#E2495F",
        amber: "#D97706",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

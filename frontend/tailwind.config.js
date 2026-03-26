/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'tm-primary': '#4f46e5',
                'tm-secondary': '#eef2ff',
                'tm-dark': '#1e1b4b',
                'tm-mint': '#10b981',
                'tm-danger': '#f43f5e',
                'tm-danger-light': '#fff1f2',
                'tm-star': '#fbbf24',
            },
            fontFamily: {
                sans: ['Pretendard', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
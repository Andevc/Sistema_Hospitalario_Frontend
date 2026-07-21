/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F5F1',
        surface: '#FFFFFF',
        ink: '#1F2A24',
        inksoft: '#5B6760',
        brand: {
          DEFAULT: '#0E5B4A',
          deep: '#08392E',
          soft: '#E4EEE9',
        },
        line: '#E2DFD6',
        triaje: {
          rojo: '#C2402C',
          rojoSoft: '#F6E4E0',
          amarillo: '#C58A1E',
          amarilloSoft: '#F7EDD9',
          verde: '#3D7A4E',
          verdeSoft: '#E4EEE7',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(31,42,36,0.06), 0 8px 24px -8px rgba(31,42,36,0.10)',
      },
      borderRadius: {
        md2: '10px',
      },
    },
  },
  plugins: [],
}

import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				background: '#1f2937',
				sidebar:		'#111827',
				primary:    '#15803d',
				secondary:  '#22a5ce',
				accent:     '#4ade80',
			},
		}
	},

	plugins: [typography, forms]
};

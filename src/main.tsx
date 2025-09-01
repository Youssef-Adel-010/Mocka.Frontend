import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

function clearFormInputs() {
	try {
		const els = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')
		els.forEach((el) => {
			if (el instanceof HTMLInputElement) {
				const t = el.type?.toLowerCase()
				if (t === 'checkbox' || t === 'radio') el.checked = false
				else el.value = ''
			} else if (el instanceof HTMLTextAreaElement) {
				el.value = ''
			} else if (el instanceof HTMLSelectElement) {
				el.selectedIndex = -1
			}
		})
	} catch (e) {
		// ignore DOM errors in SSR or unusual environments
	}
}

// Clear inputs on normal load and pageshow (covers reload and back/forward cache)
window.addEventListener('DOMContentLoaded', clearFormInputs)
window.addEventListener('pageshow', clearFormInputs)

createRoot(document.getElementById("root")!).render(<App />);

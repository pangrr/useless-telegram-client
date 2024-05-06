import { createApp } from 'vue'
import App from './App.vue'

import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/aura-dark-green/theme.css'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Menubar from 'primevue/menubar'
import Listbox from 'primevue/listbox'
import Card from 'primevue/card'

const app = createApp(App)

app.use(PrimeVue)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Splitter', Splitter)
app.component('SplitterPanel', SplitterPanel)
app.component('Menubar', Menubar)
app.component('Listbox', Listbox)
app.component('Card', Card)

app.mount('#app')

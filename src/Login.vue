<template>
	<n-flex justify='center'>
		<n-flex vertical justify='center' style='height: 100vh;'>
			<n-alert type='success' :bordered='false' :show-icon='false'>Use your Telegram phone number to login</n-alert>
			<n-input-group>
				<n-input v-model:value='phoneNumber' type='text' placeholder='Phone Number' />
				<n-button @click='sendCode' :loading='disableSendCode'>Send Code</n-button>
			</n-input-group>
			<n-input-group>
				<n-input v-model:value='phoneCode' type='text' placeholder='Code' />
				<n-button @click='login' type='primary' :disabled='!phoneCode'>Login</n-button>
			</n-input-group>
		</n-flex>
	</n-flex>
</template>


<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()

const props = defineProps(['client', 'authCredentials'])
const { client, authCredentials } = props
const emit = defineEmits(['loggedIn'])

const phoneNumber = ref('+8618716398744')
const phoneCode = ref()
const disableSendCode = ref(false)

async function sendCode() {
	try {
		disableSendCode.value = true
		await client.sendCode(authCredentials, phoneNumber.value)
		message.info('Check your other telegram app for the phone code.', { keepAliveOnHover: true, duration: 10000 })
		setTimeout(() => disableSendCode.value = false, 20000)
	} catch (e) {
		disableSendCode.value = false
		message.error(e.message, { keepAliveOnHover: true, duration: 10000 })
		console.error(e)
	}
}

async function login() {
	try {
		await client.signInUser(authCredentials, { phoneNumber: phoneNumber.value, phoneCode: phoneCode.value })
		phoneCode.value = null
		localStorage.setItem('session', JSON.stringify(client.session.save()))
		emit('loggedIn')
	} catch (e) {
		console.error(e)
		message.error(e.message, { keepAliveOnHover: true, duration: 10000 })
	}
}

</script>


<style scoped></style>

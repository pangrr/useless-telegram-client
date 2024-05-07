<template>
	<n-layout position='absolute'>
		<n-layout-header style='height: 64px; padding: 24px'>
			<n-space>
				<n-button @click='logout'>Logout</n-button>
			</n-space>
		</n-layout-header>
		<n-layout has-sider position='absolute' style='top: 64px; bottom: 64px'>
			<n-layout-sider bordered content-style='padding: 24px;'>

			</n-layout-sider>
			<n-layout content-style='padding: 24px;'>

			</n-layout>
		</n-layout>
	</n-layout>
</template>


<script setup>
import { defineProps, defineEmits, onMounted, ref } from 'vue'
import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { NewMessage } from 'telegram/events'
import { darkTheme, useMessage } from 'naive-ui'

const message = useMessage()

const props = defineProps(['client'])
const { client } = props
const emit = defineEmits(['loggedOut'])

const user = ref()
const dialogs = ref([])
const dialogSelected = ref()
const messages = ref([])
const inputMessage = ref('')
const participants = ref([])

onMounted(async () => {
	user.value = await client.getMe()
	console.log('user', user.value)
	dialogs.value = await client.getDialogs()
	selectDialog(dialogs.value[0])
	console.log('dialogs', dialogs.value)
	client.addEventHandler((e) => console.log(e), new NewMessage({}));
})

async function sendMessage() {
	if (inputMessage.value.length > 0) {
		client.sendMessage(dialogSelected.value.entity, { message: inputMessage.value })
		inputMessage.value = ''
	}
}

function getParticipantName(userId, participants) {
	const user = participants.find(user => user.id.value === userId?.value)
	return `${user?.firstName} ${user?.lastName}`
}

async function selectDialog(dialog) {
	if (dialog) {
		dialogSelected.value = dialog
		getDialogMessages(dialog)
		getDialogParticipants(dialog)
	}
}


async function getDialogMessages(dialog) {
	messages.value = (await client.getMessages(dialog.entity, { limit: 99999 })).reverse()
	console.log('messages', messages.value)
}

async function getDialogParticipants(dialog) {
	participants.value = await client.getParticipants(dialog.entity)
	console.log('participants', participants.value)
}

function logout() {
	localStorage.removeItem('session')
	user.value = null
	emit('loggedOut')
}
</script>


<style scoped></style>

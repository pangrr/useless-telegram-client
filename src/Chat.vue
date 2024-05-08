<template>
	<div style='height: 100vh;width: 100vw;position: fixed;'>
		<n-flex justify='end' style='height: 2rem;'>
			<n-button quaternary @click='logout'>Logout</n-button>
		</n-flex>
		<n-tabs :value='selectedDialogIdStr' :on-update:value='selectDialog' size='large' type='line' placement='left'
			style='height: calc(100vh - 2rem);'>
			<n-tab-pane v-for='d in dialogs' :key='d.id.value.toString()' :name='d.id.toString()' :tab='d.name'
				display-directive='show'>
				<n-flex vertical style='height: 100%;'>
					<div :id='d.id.value.toString()' ref='messageListRefs' style='flex-grow: 1;overflow-y: scroll;'>
						<n-card v-for='m in d.messages'>
							<!-- {{ getMessageSenderName(m, d) }} -->
							<template #footer>
								{{ m.message }}
							</template>
						</n-card>
					</div>
					<n-flex justify='center' style='margin-bottom: 1rem;'>
						<n-input style='flex-basis: 80%'></n-input>
						<n-button>Send</n-button>
					</n-flex>
				</n-flex>
			</n-tab-pane>
		</n-tabs>
	</div>
</template>


<script setup>
import { defineProps, defineEmits, onMounted, ref, watch, nextTick } from 'vue'
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
const selectedDialogIdStr = ref('')
const messageListRefs = ref([])

onMounted(async () => {
	user.value = await client.getMe()
	console.log('user', user.value)
	dialogs.value = await getDialogs()
	await selectDialog(dialogs.value[0].id.toString())
	console.log('dialogs', dialogs.value)

	client.addEventHandler((e) => console.log(e), new NewMessage({}))
})

async function getDialogs() {
	return await client.getDialogs()
}

async function sendMessage() {
	if (inputMessage.value.length > 0) {
		client.sendMessage(dialog.value.entity, { message: inputMessage.value })
		inputMessage.value = ''
	}
}

function getMessageSenderName(message, dialog) {
	const user = dialog.participants.find(user => user.id.value === message.fromId?.userId.value)
	if (user) return `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
	else return ''
}

async function selectDialog(idStr) {
	selectedDialogIdStr.value = idStr
	const dialog = dialogs.value.find(d => d.id.toString() === idStr)
	if (!dialog.messages) {
		dialog.messages = await getDialogMessages(dialog)
		dialog.participants = await getDialogParticipants(dialog)
		dialog.inputMessage = ''
		await scrollToLastMessage(idStr)
	}
}

async function scrollToLastMessage(dialogIdStr) {
	await nextTick()
	const mListEl = messageListRefs.value.find(r => r.id === dialogIdStr)
	mListEl.scrollTo({ top: mListEl.scrollHeight, behavior: 'instant' })
}

async function getDialogMessages(dialog) {
	return (await client.getMessages(dialog.entity, { limit: 500 })).reverse()
}

async function getDialogParticipants(dialog) {
	return await client.getParticipants(dialog.entity)
}

function logout() {
	localStorage.removeItem('session')
	user.value = null
	emit('loggedOut')
}
</script>


<style scoped></style>

<template>
	<div vertical style='height: 100vh;width: 100vw;position: fixed;'>
		<n-flex justify='end' style='height: 2.2rem;'>
			<n-button quaternary @click='logout'>Logout</n-button>
		</n-flex>
		<n-tabs :value='selectedDialogIdStr' :on-update:value='selectDialog' size='large' type='line' placement='left'
			style='height: calc(100vh - 2.2rem);'>
			<n-tab-pane v-for='d in dialogs' :key='d.id.value.toString()' :name='d.id.toString()' :tab='d.name'
				display-directive='show'>
				<n-flex v-if='d.messages' vertical style='height: 100%;'>
					<div :id='d.id.value.toString()' ref='messageListRefs' style='flex-grow: 1;overflow-y: scroll;'>
						<n-flex v-for='m in d.messages' :justify='m.out ? "end" : "start"' style='padding: 0.3rem 1rem;'>
							<n-el style='max-width: 70%;padding: 0.5rem;border-radius: 10px;'
								:style='{ background: m.out ? "var(--primary-color-suppl)" : "var(--input-color)" }'>
								<n-text v-if='!m.out && m.senderName' type='success' style='font-size: 0.7rem;'>{{ m.senderName
									}}</n-text>
								<n-flex align='end'>
									<n-text depth='1'>{{ m.message }}</n-text>
									<n-text depth='3' style='font-size: 0.6rem;'>{{ formatMessageTime(m.date) }}</n-text>
								</n-flex>
							</n-el>
						</n-flex>
					</div>
					<n-flex justify='center' style='margin-top: 0.5rem;margin-bottom: 1rem;'>
						<n-input v-model:value='d.inputMessage' @keydown.meta.enter='sendMessage(d)' placeholder='Message'
							type="textarea" :autosize='{ minRows: 1, maxRows: 5 }' style='flex-basis: 80%'></n-input>
						<n-button @click='sendMessage(d)' tertiary type='primary' :disabled='!d.inputMessage.length'>Send</n-button>
					</n-flex>
				</n-flex>
			</n-tab-pane>
		</n-tabs>
	</div>
</template>


<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { NewMessage } from 'telegram/events'
import { useMessage, useLoadingBar } from 'naive-ui'
import dayjs from 'dayjs'


const message = useMessage()
const loadingBar = useLoadingBar()

const props = defineProps(['client'])
const { client } = props
const emit = defineEmits(['loggedOut'])

const user = ref()
const dialogs = ref([])
const selectedDialogIdStr = ref('')
const messageListRefs = ref([])

onMounted(async () => {
	user.value = await client.getMe()
	dialogs.value = await getDialogs()
	await selectDialog(dialogs.value[0].id.toString())

	client.addEventHandler(onMessageReceived, new NewMessage({}))
})

async function onMessageReceived(e) {
	const dialog = whichDialogForMessage(e.message)
	if (dialog) {
		dialog.messages.push(e.message)
		await scrollToLastMessage(dialog.id.toString())
	}
}

function whichDialogForMessage(message) {
	const userId = message.peerId.userId?.toString()
	const chatId = message.peerId.chatId?.toString()
	if (userId) return dialogs.value.find(d => d.isUser && d.id.toString() === userId)
	else if (chatId) return dialogs.value.find(d => (d.isGroup || d.isChannel) && d.id.toString() === ('-' + chatId))
}

async function selectDialog(idStr) {
	selectedDialogIdStr.value = idStr
	const dialog = dialogs.value.find(d => d.id.toString() === idStr)
	if (!dialog.messages) {
		loadingBar.start()
		dialog.inputMessage = ''
		dialog.participants = await getDialogParticipants(dialog)
		dialog.messages = await getDialogMessages(dialog)
		dialog.messages.forEach(m => m.senderName = getMessageSenderName(m, dialog))
		await scrollToLastMessage(idStr)
		loadingBar.finish()
	}
}

async function getDialogs() {
	return await client.getDialogs()
}

async function sendMessage(dialog) {
	const messageSent = await client.sendMessage(dialog.entity, { message: dialog.inputMessage })
	dialog.messages.push(messageSent)
	dialog.inputMessage = ''
	await scrollToLastMessage(dialog.id.toString())
}

function getMessageSenderName(message, dialog) {
	const user = dialog.participants.find(user => user.id.value === message.fromId?.userId.value)
	if (user) return `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
	else return ''
}

async function scrollToLastMessage(dialogIdStr) {
	// Ensure scroll target element is updated before scrolling.
	await nextTick()
	const mListEl = messageListRefs.value.find(r => r.id === dialogIdStr)
	mListEl.scrollTo({ top: mListEl.scrollHeight, behavior: 'instant' })
}

async function getDialogMessages(dialog) {
	return (await client.getMessages(dialog.entity, { limit: 500 })).filter(m => m.message).reverse()
}

async function getDialogParticipants(dialog) {
	return await client.getParticipants(dialog.entity)
}

function logout() {
	localStorage.removeItem('session')
	user.value = null
	emit('loggedOut')
}

function formatMessageTime(timestamp) {
	const then = dayjs.unix(timestamp)
	const now = dayjs()
	if (now.diff(then, 'day') < 1) return then.format('HH:mm')
	else if (now.diff(then, 'year') < 1) return then.format('MM-DD HH:mm')
	else return then.format('YYYY-MM-DD HH:mm')
}
</script>


<style scoped></style>

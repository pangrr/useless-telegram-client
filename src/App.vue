<template>
  <div style='height: 100vh; width: 100vw; position: fixed;top: 0;left: 0;' class='flex flex-column'>
    <Menubar style='border: none;background-color: var(--surface-50);height: 2.5rem;'>
      <template #end>
        <Button @click='logout' icon='pi pi-sign-out' label='Logout' text severity='contrast' size='small' />
      </template>
    </Menubar>
    <Splitter v-if='loggedIn === true' :gutterSize='1' style='border: none;'>
      <SplitterPanel :size='25' :minSize='20'>
        <Listbox :modelValue='dialogSelected' :options='dialogs' @change='({ value }) => selectDialog(value)'
          style='border: none;background-color: var(--surface-50);' listStyle='height:calc(100vh - 2.5rem)'>
          <template #option='slotProps'>
            <div class='flex align-items-center h-3rem'>
              <img src='' class='mr-2' style='width: 18px' />
              <div>{{ slotProps.option.name }}</div>
            </div>
          </template>
        </Listbox>
      </SplitterPanel>
      <SplitterPanel class='flex flex-column' :size='75' :minSize='60'>
        <Listbox v-model='messagesSelected' :options='messages' multiple listStyle='height:calc(100vh - 5.5rem)'
          style='border: none;'>
          <template #option='slotProps'>
            <div :class="`flex align-items-center justify-content-${slotProps.option.out ? 'end' : 'start'}`">
              <Card style="max-width: 30%;min-height: 2rem;"
                :style='{ background: slotProps.option.out ? "var(--green-500)" : "var(--gray-800)" }'>
                <template v-if='!slotProps.option.out' #subtitle>{{ getParticipantName(slotProps.option.fromId?.userId,
                  participants) }}</template>
                <template #content>
                  <p style="font-size: 0.9rem;margin: 0;">
                    {{ slotProps.option.message }}
                  </p>
                </template>
              </Card>
            </div>
          </template>
        </Listbox>
        <div class='flex justify-content-center' style='width: 100%;height: 2.5rem;'>
          <InputText type="text" v-model='inputMessage' style="width: 60%;margin-right: 1rem;" />
          <Button @click='sendMessage' :disabled='!inputMessage'>Send</Button>
        </div>
      </SplitterPanel>
    </Splitter>
    <div v-else-if='loggedIn === false' style='height: 100vh; width: 100vw;'
      class='flex justify-content-center flex-grow-1'>
      <div class='flex flex-column gap-2 justify-content-center'>
        <label for='phone'>Phone Number</label>
        <InputText id='phone' type='text' v-model='phone' />
        <Button label='Send Code' @click='sendCode' />
        <label for='code'>Code</label>
        <InputText id='code' v-model='code' />
        <Button label='Login' @click='login' />
      </div>
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref, watch } from 'vue'
import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { NewMessage } from 'telegram/events'

const authCredentials = { apiId: 1025907, apiHash: '452b0359b988148995f22ff0f4229750' }
const session = localStorage.getItem('session') ? new StringSession(JSON.parse(localStorage.getItem('session'))) : new StringSession('')
const client = new TelegramClient(session, authCredentials.apiId, authCredentials.apiHash, { connectionRetries: 3 })

const phone = ref('+8618716398744')
const code = ref()
const loggedIn = ref()
const user = ref()
const dialogs = ref([])
const dialogSelected = ref()
const messages = ref([])
const messagesSelected = ref([])
const inputMessage = ref('')
const participants = ref([])

onMounted(async () => {
  await client.connect()
  if (await client.checkAuthorization()) {
    await onLoggedIn()
  } else {
    loggedIn.value = false
  }
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

async function sendCode() {
  await client.sendCode(authCredentials, phone.value)
}

async function login() {
  try {
    await client.signInUser(authCredentials, { phoneNumber: phone.value, phoneCode: code.value })
    localStorage.setItem('session', JSON.stringify(client.session.save()))
    await onLoggedIn()
  } catch (e) {
    console.error(e)
  }
}

function logout() {
  localStorage.removeItem('session')
  user.value = null
  loggedIn.value = false
}

async function onLoggedIn() {
  user.value = await client.getMe()
  console.log('user', user.value)
  loggedIn.value = true
  dialogs.value = await client.getDialogs()
  selectDialog(dialogs.value[0])
  console.log('dialogs', dialogs.value)
  client.addEventHandler((e) => console.log(e), new NewMessage({}));
}
</script>


<style scoped>
:deep(.p-listbox .p-listbox-list .p-listbox-item.p-highlight) {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

:deep(.p-card .p-card-body) {
  padding: 0.5rem;
}
</style>

<template>
  <Splitter v-if="user" style="height: 100vh; width: 100vw;">
    <SplitterPanel class="flex align-items-center justify-content-center" :size="25" :minSize="10">dialogs
    </SplitterPanel>
    <SplitterPanel class="flex align-items-center justify-content-center" :size="75"> Panel 2 </SplitterPanel>
  </Splitter>
  <div v-else class='flex justify-content-center' style="height: 100vh; width: 100vw;">
    <div class='flex flex-column gap-2 justify-content-center'>
      <label for='phone'>Phone Number</label>
      <InputText id='phone' type='text' v-model='phone' />
      <Button label='Send Code' @click='sendCode' />
      <label for='code'>Code</label>
      <InputText id='code' v-model='code' />
      <Button label='Login' @click='login' />
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions'

const authCredentials = { apiId: 1025907, apiHash: '452b0359b988148995f22ff0f4229750' }
const session = localStorage.getItem('session') ? new StringSession(JSON.parse(localStorage.getItem('session'))) : new StringSession('')
const client = new TelegramClient(session, authCredentials.apiId, authCredentials.apiHash, { connectionRetries: 3 })

const phone = ref('+8618716398744')
const code = ref()
const user = ref()
const dialogs = ref([])

onMounted(async () => {
  await client.connect()
  if (await client.checkAuthorization()) {
    await getDataAfterLoggedIn()
  }
})

async function sendCode() {
  await client.sendCode(authCredentials, phone.value)
}

async function login() {
  try {
    await client.signInUser(authCredentials, { phoneNumber: phone.value, phoneCode: code.value })
    localStorage.setItem('session', JSON.stringify(client.session.save()))
    await getDataAfterLoggedIn()
  } catch (e) {
    console.error(e)
  }
}

async function getDataAfterLoggedIn() {
  user.value = await client.getMe()
  dialogs.value = await client.getDialogs()
  console.log(dialogs.value)
}
</script>


<style scoped></style>

<template>
  <div style='height: 100vh; width: 100vw;'>
    <SpeedDial v-if='loggedIn === true' :model='menuItems' direction='down' style='right: 1rem; top: 2rem;' />
    <Splitter v-if='loggedIn === true'>
      <SplitterPanel :size='25' :minSize='10'>
        <Listbox v-model='selectedDialog' :options='dialogs' optionLabel='name' class='w-full' listStyle='height:100vh'>
          <template #option='slotProps'>
            <div class='flex align-items-center h-5rem'>
              <img src='' class='mr-2' style='width: 18px' />
              <div>{{ slotProps.option.name }}</div>
            </div>
          </template>
        </Listbox>
      </SplitterPanel>
      <SplitterPanel class='flex align-items-center justify-content-center' :size='75'> Panel 2 </SplitterPanel>
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
import { onMounted, ref } from 'vue'
import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions'

const authCredentials = { apiId: 1025907, apiHash: '452b0359b988148995f22ff0f4229750' }
const session = localStorage.getItem('session') ? new StringSession(JSON.parse(localStorage.getItem('session'))) : new StringSession('')
const client = new TelegramClient(session, authCredentials.apiId, authCredentials.apiHash, { connectionRetries: 3 })

const phone = ref('+8618716398744')
const code = ref()
const loggedIn = ref()
const user = ref()
const dialogs = ref([])
const selectedDialog = ref()

onMounted(async () => {
  await client.connect()
  if (await client.checkAuthorization()) {
    await onLoggedIn()
  } else {
    loggedIn.value = false
  }
})

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
  console.log('dialogs', dialogs.value)
}

const menuItems = ref([
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: logout
  }
])

</script>


<style scoped></style>

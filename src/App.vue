<template>
  <div class='card flex justify-content-center'>
    <div class='flex flex-column gap-2'> <label for='phone'>Phone Number</label>
      <InputText id='phone' type='text' v-model='phone' />
      <Button label='Send Code' @click='sendCode' />
      <label for='code'>Code</label>
      <InputText id='code' v-model='code' />
      <Button label='Login' @click='login' />
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'

const SESSION = new StringSession('')
const API_ID = 1025907
const API_HASH = '452b0359b988148995f22ff0f4229750'
const client = new TelegramClient(SESSION, API_ID, API_HASH, { connectionRetries: 3 })

const phone = ref('+8618716398744')
const code = ref()

async function sendCode() {
  await client.connect()
  await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, phone.value)
}

async function login() {
  await client.start({ phoneNumber: phone.value, phoneCode: code.value })
  await client.sendMessage('me', { message: "You're successfully logged in!" })
}
</script>


<style scoped></style>

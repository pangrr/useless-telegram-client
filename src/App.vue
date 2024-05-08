<template>
  <n-config-provider :theme='darkTheme'>
    <n-global-style />
    <n-message-provider>
      <n-loading-bar-provider>
        <login v-if='loggedIn === false' :client='client' :auth-credentials='authCredentials'
          @logged-in='loggedIn = true' />
        <chat v-else-if='loggedIn === true' :client='client' @logged-out='loggedIn = false' />
        <loading v-else />
      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { darkTheme } from 'naive-ui'
import Login from './Login.vue'
import Chat from './Chat.vue'
import Loading from './Loading.vue'

const authCredentials = { apiId: 1025907, apiHash: '452b0359b988148995f22ff0f4229750' }
const session = localStorage.getItem('session') ? new StringSession(JSON.parse(localStorage.getItem('session'))) : new StringSession('')
const client = new TelegramClient(session, authCredentials.apiId, authCredentials.apiHash, { connectionRetries: 3 })

const loggedIn = ref()

onMounted(async () => {
  await client.connect()
  loggedIn.value = await client.checkAuthorization()
})

</script>


<style scoped></style>

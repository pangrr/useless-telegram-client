<template>
  <n-config-provider :theme="darkTheme">
    <n-global-style />
    <n-message-provider>
      <n-loading-bar-provider>
        <div style="height: 100vh">
          <n-flex justify="space-between" style="height: 2.2rem">
            <n-button quaternary @click="openSourceCode">
              <template #icon>
                <n-icon>
                  <Github />
                </n-icon>
              </template>
              Source Code
            </n-button>
            <n-button v-if="user !== 0 && user !== 1" quaternary @click="logout"
              >Logout</n-button
            >
          </n-flex>
          <loading v-if="user === 0" />
          <login
            v-else-if="user === 1"
            :client="client"
            :auth-credentials="authCredentials"
            @logged-in="getUser"
          />
          <chat v-else :client="client" :user="user" />
        </div>
      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions"
import { darkTheme } from "naive-ui"
import Login from "./Login.vue"
import Chat from "./Chat.vue"
import Loading from "./Loading.vue"
import { Github } from "@vicons/fa"

const authCredentials = {
  apiId: 1025907,
  apiHash: "452b0359b988148995f22ff0f4229750"
}
const session = localStorage.getItem("session")
  ? new StringSession(JSON.parse(localStorage.getItem("session")))
  : new StringSession("")
const client = new TelegramClient(
  session,
  authCredentials.apiId,
  authCredentials.apiHash,
  { connectionRetries: 3 }
)

const user = ref(0)
const telegramServerConnected = ref(false)

onMounted(async () => {
  await client.connect()
  if (await client.checkAuthorization()) getUser()
  else user.value = 1
})

async function getUser() {
  user.value = await client.getMe()
}

function logout() {
  localStorage.removeItem("session")
  user.value = 1
}

function openSourceCode() {
  window.open("https://github.com/pangrr/useless-telegram-client", "_blank")
}
</script>

<style scoped></style>

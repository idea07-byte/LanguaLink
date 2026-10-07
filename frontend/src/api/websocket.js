import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function createStompClient({ onConnect, onError, onMessage }) {
  const token = localStorage.getItem('lingualink_token')

  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    debug: (str) => {
      // console.log('[STOMP]', str)
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  client.onConnect = (frame) => {
    // console.log('[STOMP] Connected:', frame)
    if (onConnect) onConnect(client, frame)
  }

  client.onStompError = (frame) => {
    console.warn('[STOMP] Error:', frame.headers['message'])
    if (onError) onError(frame)
  }

  client.onWebSocketClose = () => {
    // console.log('[STOMP] Disconnected')
  }

  client.activate()
  return client
}

export function subscribeToConversation(client, conversationId, callback) {
  if (!client || !client.connected) return null
  return client.subscribe(`/topic/conversation/${conversationId}`, (message) => {
    try {
      const payload = JSON.parse(message.body)
      callback(payload)
    } catch (err) {
      console.error('Failed to parse STOMP message payload', err)
    }
  })
}

export function sendStompMessage(client, conversationId, content, type = 'TEXT') {
  if (!client || !client.connected) return false
  client.publish({
    destination: '/app/chat.sendMessage',
    body: JSON.stringify({
      conversationId,
      content,
      type,
    }),
  })
  return true
}

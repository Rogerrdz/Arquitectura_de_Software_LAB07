import { Client } from '@stomp/stompjs'

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || '').replace(/\/$/, '')
}

export function createStompClient(baseUrl) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  return new Client({
    brokerURL: `${normalizedBaseUrl}/ws-blueprints`,
    reconnectDelay: 1000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  })
}

export function subscribeBlueprint(client, author, name, onMsg) {
  return client.subscribe(`/topic/blueprints.${author}.${name}`, (message) => {
    try {
      onMsg(JSON.parse(message.body))
    } catch (error) {
      console.error('[STOMP] Could not parse incoming message', error)
    }
  })
}

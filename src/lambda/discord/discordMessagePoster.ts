import { DiscordMessageTask } from '../asyncTasks/asyncTaskQueuer'
import { ConfigType } from '../getConfig'

export const postDiscordMessage = async (task: DiscordMessageTask, config: ConfigType) => {
  if (!config.DISCORD_ENABLED) return
  await fetch(config.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: task.data.message }),
  })
}

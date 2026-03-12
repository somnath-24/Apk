import { LocalNotifications } from '@capacitor/local-notifications'

export const requestNotificationPermission = async () => {
  const status = await LocalNotifications.requestPermissions()
  return status.display === 'granted'
}

export const sendNotification = async (title: string, body: string, id: number) => {
  const status = await LocalNotifications.checkPermissions()
  
  if (status.display !== 'granted') {
    const request = await LocalNotifications.requestPermissions()
    if (request.display !== 'granted') return
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: new Date(Date.now() + 1000) }, // Send almost immediately
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: null,
        },
      ],
    })
  } catch (error) {
    console.error('Error showing native notification:', error)
  }
}

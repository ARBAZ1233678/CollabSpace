import axios from 'axios'

class GoogleService {
  constructor() {
    this.isInitialized = false
    this.gapi = null
    this.auth2 = null
  }

  /**
   * Initialize Google APIs
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        resolve(this.gapi)
        return
      }

      // Load Google API script
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = async () => {
        try {
          await new Promise((resolveLoad) => {
            window.gapi.load('auth2:client', resolveLoad)
          })

          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
              'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest'
            ],
            scope: [
              'https://www.googleapis.com/auth/userinfo.profile',
              'https://www.googleapis.com/auth/userinfo.email',
              'https://www.googleapis.com/auth/drive.file',
              'https://www.googleapis.com/auth/calendar.events',
              'https://www.googleapis.com/auth/spreadsheets'
            ].join(' ')
          })

          this.gapi = window.gapi
          this.auth2 = window.gapi.auth2.getAuthInstance()
          this.isInitialized = true

          console.log('Google APIs initialized successfully')
          resolve(this.gapi)
        } catch (error) {
          console.error('Failed to initialize Google APIs:', error)
          reject(error)
        }
      }

      script.onerror = () => {
        reject(new Error('Failed to load Google APIs script'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * Sign in with Google OAuth
   */
  async signIn() {
    try {
      await this.initialize()

      const authResult = await this.auth2.signIn()
      const authResponse = authResult.getAuthResponse()
      const profile = authResult.getBasicProfile()

      return {
        accessToken: authResponse.access_token,
        idToken: authResponse.id_token,
        expiresAt: authResponse.expires_at,
        user: {
          id: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          picture: profile.getImageUrl()
        }
      }
    } catch (error) {
      console.error('Google sign-in failed:', error)
      throw error
    }
  }

  /**
   * Sign out from Google
   */
  async signOut() {
    try {
      if (this.auth2) {
        await this.auth2.signOut()
      }
    } catch (error) {
      console.error('Google sign-out failed:', error)
      throw error
    }
  }

  /**
   * Get current signed-in user
   */
  getCurrentUser() {
    if (!this.auth2) return null

    const user = this.auth2.currentUser.get()
    if (user.isSignedIn()) {
      const profile = user.getBasicProfile()
      return {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl()
      }
    }

    return null
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return this.auth2?.isSignedIn.get() || false
  }

  /**
   * Upload file to Google Drive
   */
  async uploadToDrive(file, fileName, folderId = null) {
    try {
      await this.initialize()

      const metadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      }

      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      form.append('file', file)

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.auth2.currentUser.get().getAuthResponse().access_token}`
        },
        body: form
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to upload to Google Drive:', error)
      throw error
    }
  }

  /**
   * Create Google Calendar event
   */
  async createCalendarEvent(eventData) {
    try {
      await this.initialize()

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: eventData.attendees?.map(email => ({ email })),
        conferenceData: eventData.meetingUrl ? {
          createRequest: {
            requestId: Date.now().toString(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        } : undefined
      }

      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      })

      return response.result
    } catch (error) {
      console.error('Failed to create calendar event:', error)
      throw error
    }
  }

  /**
   * Create Google Sheets document
   */
  async createSpreadsheet(title, data = []) {
    try {
      await this.initialize()

      // Create spreadsheet
      const response = await this.gapi.client.sheets.spreadsheets.create({
        resource: {
          properties: {
            title: title
          }
        }
      })

      const spreadsheetId = response.result.spreadsheetId

      // Add data if provided
      if (data.length > 0) {
        await this.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: 'A1',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: data
          }
        })
      }

      return {
        id: spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        title: title
      }
    } catch (error) {
      console.error('Failed to create Google Sheets document:', error)
      throw error
    }
  }

  /**
   * Export data to Google Sheets
   */
  async exportToSheets(title, data) {
    try {
      const result = await this.createSpreadsheet(title, data)
      return result
    } catch (error) {
      console.error('Failed to export to Google Sheets:', error)
      throw error
    }
  }
}

export const googleService = new GoogleService()
export default googleService

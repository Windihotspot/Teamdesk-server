import 'dotenv/config'
import 'express-async-errors'

import { buildApp } from './app'
import { config } from './shared/config/config'

async function bootstrap() {
  try {
    const app = buildApp()

    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`)
      console.log(`🌍 Environment: ${config.NODE_ENV || 'development'}`)
      console.log(`📅 Started at: ${new Date().toISOString()}`)
    })

    // -------------------------
    // Graceful Shutdown Handler
    // -------------------------
    const shutdown = (signal: string) => {
      console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`)

      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err)
          process.exit(1)
        }

        console.log('✅ Server closed successfully')
        process.exit(0)
      })

      // Force shutdown if hanging (10s timeout)
      setTimeout(() => {
        console.error('⏳ Force shutting down...')
        process.exit(1)
      }, 10000)
    }

    // -------------------------
    // Process Events
    // -------------------------
    process.on('SIGINT', shutdown)   // Ctrl + C
    process.on('SIGTERM', shutdown)  // Deployment stop

    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err)
      shutdown('uncaughtException')
    })

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Rejection:', reason)
      shutdown('unhandledRejection')
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

void bootstrap()
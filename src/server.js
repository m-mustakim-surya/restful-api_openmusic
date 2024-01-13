require('dotenv').config()

const Hapi = require('@hapi/hapi')
const musics = require('./api/musics')
const MusicsService = require('./services/postgres/MusicsService')
const MusicsValidator = require('./validator/musics')
const ClientError = require('./exceptions/ClientError')

const init = async () => {
  const musicsService = new MusicsService()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register({
    plugin: musics,
    options: {
      service: musicsService,
      validator: MusicsValidator
    }
  })

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse
    }

    return h.continue
  })

  await server.start()
  console.log(`The server is running on ${server.info.uri}`)
}

init()

require('dotenv').config()

const Hapi = require('@hapi/hapi')
const musics = require('./api/musics')
const AlbumsService = require('./services/postgres/AlbumsService')
const SongsService = require('./services/postgres/SongsService')
const MusicsValidator = require('./validator/musics')
const ClientError = require('./exceptions/ClientError')

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()

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
      services: { albumsService, songsService },
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

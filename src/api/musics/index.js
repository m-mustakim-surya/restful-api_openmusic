const MusicsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'musics',
  version: '1.0.0',
  register: async (server, { services, validator }) => {
    const musicsHandler = new MusicsHandler(services, validator)
    server.route(routes(musicsHandler))
  }
}

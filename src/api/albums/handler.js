const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._service.addAlbum({ name, year })

    const response = h.response({
      status: 'success',
      message: 'Menambahkan album',
      data: {
        albumId
      }
    })

    response.code(201)
    return response
  }

  async getAlbumByIdHandler (request, h) {
    const { id } = request.params

    const album = await this._service.getAlbumById(id)
    album.coverUrl = (album.coverUrl) ? `http://${process.env.HOST}:${process.env.PORT}/upload/images/${album.coverUrl}` : null
    const songs = await this._service.getSongsByAlbumId(id)

    const albumSongs = { ...album, songs }

    return {
      status: 'success',
      message: 'Mendapatkan album berdasarkan id',
      data: {
        album: albumSongs
      }
    }
  }

  async putAlbumByIdHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { id } = request.params

    await this._service.editAlbumById(id, request.payload)

    return {
      status: 'success',
      message: 'Mengubah album berdasarkan id album'
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params

    await this._service.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'Menghapus album berdasarkan id'
    }
  }
}

module.exports = AlbumsHandler

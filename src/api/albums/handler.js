const autoBind = require('auto-bind')
const config = require('../../utils/config')

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
    album.coverUrl = (album.coverUrl) ? `http://${config.app.host}:${config.app.port}/upload/images/${album.coverUrl}` : null
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

  async postAlbumLikeHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id: albumId } = request.params

    await this._service.verifyAlbumExist(albumId)
    await this._service.verifyAlbumLikeExist(credentialId, albumId)
    const albumLikeId = await this._service.addAlbumLike(credentialId, albumId)

    const response = h.response({
      status: 'success',
      message: 'Menyukai album',
      data: {
        albumLikeId
      }
    })

    response.code(201)
    return response
  }

  async deleteAlbumLikeHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id: albumId } = request.params

    await this._service.deleteAlbumLike(credentialId, albumId)

    return {
      status: 'success',
      message: 'Batal menyukai album'
    }
  }

  async getAlbumLikesHandler (request, h) {
    const { id: albumId } = request.params

    const { albumLikes, source } = await this._service.getAlbumLikes(albumId)

    const response = h.response({
      status: 'success',
      message: 'Melihat jumlah yang menyukai album',
      data: albumLikes
    })

    response.header('X-Data-Source', source)
    response.code(200)
    return response
  }
}

module.exports = AlbumsHandler

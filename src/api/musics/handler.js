const autoBind = require('auto-bind')

class MusicsHandler {
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

  async postSongHandler (request, h) {
    this._validator.validateSongPayload(request.payload)
    const { title, year, genre, performer, duration, albumId } = request.payload

    const songId = await this._service.addSong({ title, year, genre, performer, duration, albumId })

    const response = h.response({
      status: 'success',
      message: 'Menambahkan lagu',
      data: {
        songId
      }
    })

    response.code(201)
    return response
  }

  async getSongsHandler (request, h) {
    const { title, performer } = request.query

    const songs = await this._service.getSongs(title, performer)

    return {
      status: 'success',
      message: 'Mendapatkan seluruh lagu',
      data: {
        songs
      }
    }
  }

  async getSongByIdHandler (request, h) {
    const { id } = request.params

    const song = await this._service.getSongById(id)

    return {
      status: 'success',
      message: 'Mendapatkan lagu berdasarkan id',
      data: {
        song
      }
    }
  }

  async putSongByIdHandler (request, h) {
    this._validator.validateSongPayload(request.payload)
    const { id } = request.params

    await this._service.editSongById(id, request.payload)

    return {
      status: 'success',
      message: 'Mengubah lagu berdasarkan id lagu'
    }
  }

  async deleteSongByIdHandler (request, h) {
    const { id } = request.params

    await this._service.deleteSongById(id)

    return {
      status: 'success',
      message: 'Menghapus lagu berdasarkan id'
    }
  }
}

module.exports = MusicsHandler

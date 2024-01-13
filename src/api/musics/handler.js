const autoBind = require('auto-bind')

class MusicsHandler {
  constructor (services, validator) {
    this._albumsService = services.albumsService
    this._songsService = services.songsService
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._albumsService.addAlbum({ name, year })

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

    const album = await this._albumsService.getAlbumById(id)
    const songs = await this._albumsService.getSongsByAlbumId(id)

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

    await this._albumsService.editAlbumById(id, request.payload)

    return {
      status: 'success',
      message: 'Mengubah album berdasarkan id album'
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params

    await this._albumsService.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'Menghapus album berdasarkan id'
    }
  }

  async postSongHandler (request, h) {
    this._validator.validateSongPayload(request.payload)
    const { title, year, genre, performer, duration, albumId } = request.payload

    const songId = await this._songsService.addSong({ title, year, genre, performer, duration, albumId })

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

    const songs = await this._songsService.getSongs(title, performer)

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

    const song = await this._songsService.getSongById(id)

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

    await this._songsService.editSongById(id, request.payload)

    return {
      status: 'success',
      message: 'Mengubah lagu berdasarkan id lagu'
    }
  }

  async deleteSongByIdHandler (request, h) {
    const { id } = request.params

    await this._songsService.deleteSongById(id)

    return {
      status: 'success',
      message: 'Menghapus lagu berdasarkan id'
    }
  }
}

module.exports = MusicsHandler

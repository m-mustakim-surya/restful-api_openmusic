const autoBind = require('auto-bind')

class PlaylistsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postPlaylistHandler (request, h) {
    this._validator.validatePlaylistPayload(request.payload)
    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId })

    const response = h.response({
      status: 'success',
      message: 'Menambahkan playlist',
      data: {
        playlistId
      }
    })

    response.code(201)
    return response
  }

  async getPlaylistsHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._service.getPlaylists(credentialId)

    return {
      status: 'success',
      message: 'Melihat daftar playlist yang dimiliki',
      data: {
        playlists
      }
    }
  }

  async deletePlaylistByIdHandler (request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.deletePlaylistById(id)

    return {
      status: 'success',
      message: 'Menghapus playlist'
    }
  }

  async postPlaylistSongHandler (request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)
    const { id: playlistId } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(playlistId, credentialId)
    await this._service.verifySongExist(songId)
    const playlistSongId = await this._service.addPlaylistSong({ playlistId, songId })

    const response = h.response({
      status: 'success',
      message: 'Menambahkan lagu ke playlist',
      data: {
        playlistSongId
      }
    })

    response.code(201)
    return response
  }

  async getPlaylistSongsHandler (request, h) {
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(playlistId, credentialId)
    const playlist = await this._service.getPlaylistById(playlistId)
    const songs = await this._service.getSongsByPlaylistId(playlistId)

    const playlistSongs = { ...playlist, songs }

    return {
      status: 'success',
      message: 'Melihat daftar lagu di dalam playlist',
      data: {
        playlist: playlistSongs
      }
    }
  }

  async deletePlaylistSongHandler (request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)
    const { id: playlistId } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(playlistId, credentialId)
    await this._service.deletePlaylistSong({ playlistId, songId })

    return {
      status: 'success',
      message: 'Menghapus lagu dari playlist'
    }
  }
}

module.exports = PlaylistsHandler

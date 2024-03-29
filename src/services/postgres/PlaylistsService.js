const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor () {
    this._pool = new Pool()
  }

  async addPlaylist ({ name, owner }) {
    const id = 'playlist-' + nanoid(16)

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      JOIN users ON playlists.owner = users.id
      WHERE owner = $1`,
      values: [owner]
    }

    const result = await this._pool.query(query)
    return result.rows
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan')
    }
  }

  async addPlaylistSong ({ playlistId, songId }) {
    const id = 'playlist_song-' + nanoid(16)

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist')
    }

    return result.rows[0].id
  }

  async getPlaylistById (id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      JOIN users ON playlists.owner = users.id
      WHERE playlists.id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows[0]
  }

  async getSongsByPlaylistId (id) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlists
      JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id
      JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlists.id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async deletePlaylistSong ({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu dari playlist')
    }
  }

  async verifyPlaylistOwner (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifySongExist (songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
  }
}

module.exports = PlaylistsService

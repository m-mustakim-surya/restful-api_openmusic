const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils')

class MusicsService {
  constructor () {
    this._pool = new Pool()
  }

  async addAlbum ({ name, year }) {
    const id = 'album-' + nanoid(16)

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return result.rows[0]
  }

  async getSongsByAlbumId (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows.map(song => ({ id: song.id, title: song.title, performer: song.performer }))
  }

  async editAlbumById (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan')
    }
  }

  async addSong ({ title, year, genre, performer, duration, albumId }) {
    const id = 'song-' + nanoid(16)

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongs (title, performer) {
    let textQuery = 'SELECT * FROM songs WHERE 1=1'
    const valuesQuery = []

    if (title) {
      textQuery += ' AND title ILIKE $1'
      valuesQuery.push(`%${title}%`)
    }

    if (performer) {
      textQuery += ' AND performer ILIKE $'
      textQuery += (title) ? '2' : '1'
      valuesQuery.push(`%${performer}%`)
    }

    const result = await this._pool.query({
      text: textQuery,
      values: valuesQuery
    })

    return result.rows.map(song => ({ id: song.id, title: song.title, performer: song.performer }))
  }

  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapDBToModel)[0]
  }

  async editSongById (id, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan')
    }
  }
}

module.exports = MusicsService
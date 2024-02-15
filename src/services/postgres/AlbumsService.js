const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapAlbumDBToModel } = require('../../utils/album')

class AlbumsService {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
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

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return mapAlbumDBToModel(result.rows[0])
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

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan')
    }
  }

  async editAlbumCover (id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui sampul. Id tidak ditemukan')
    }
  }

  async verifyAlbumExist (albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }
  }

  async addAlbumLike (userId, albumId) {
    const id = 'ua_like-' + nanoid(16)

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Like album gagal ditambahkan')
    }

    await this._cacheService.delete(`likes:${albumId}`)
    return result.rows[0].id
  }

  async deleteAlbumLike (userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus like album. Id tidak ditemukan')
    }

    await this._cacheService.delete(`likes:${albumId}`)
  }

  async getAlbumLikes (albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`)
      return { albumLikes: JSON.parse(result), source: 'cache' }
    } catch (error) {
      const query = {
        text: 'SELECT CAST(COUNT(id) AS INT) AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      }

      const result = await this._pool.query(query)

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result.rows[0]))

      return { albumLikes: result.rows[0], source: 'database' }
    }
  }

  async verifyAlbumLikeExist (userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (result.rowCount) {
      throw new InvariantError('Gagal menambahkan like album, album sudah disukai')
    }
  }
}

module.exports = AlbumsService

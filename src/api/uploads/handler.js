const autoBind = require('auto-bind')

class UploadsHandler {
  constructor (storageService, albumsService, validator) {
    this._storageService = storageService
    this._albumsService = albumsService
    this._validator = validator

    autoBind(this)
  }

  async postUploadImageHandler (request, h) {
    const { id } = request.params
    const { cover } = request.payload
    this._validator.validateImageHeaders(cover.hapi.headers)

    const filename = await this._storageService.writeFile(cover, cover.hapi)
    await this._albumsService.editAlbumCover(id, filename)

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: {
        fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`
      }
    })
    response.code(201)
    return response
  }
}

module.exports = UploadsHandler

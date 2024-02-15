/* eslint-disable camelcase */
const mapAlbumDBToModel = ({
  id,
  name,
  year,
  cover
}) => ({
  id,
  name,
  year,
  coverUrl: cover
})

module.exports = { mapAlbumDBToModel }

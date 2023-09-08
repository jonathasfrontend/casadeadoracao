const mongoose = require('mongoose')
const moment = require('moment')
const data = moment(new Date()).format('LL');

const PostSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  createdAt:{
    type: String,
    default: data
  },
});

module.exports = mongoose.model('comment', PostSchema);
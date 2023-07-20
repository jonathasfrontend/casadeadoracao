const mongoose = require('mongoose')
const moment = require('moment')
const data = moment(new Date()).format('LL');

const PostSchema = new mongoose.Schema(

  {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    autor: {
      type: String,
      required: true
    },
    createdAt:{
      type: String,
      default: data
    }
});

module.exports = mongoose.model('noticias', PostSchema);
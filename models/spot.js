const mongoose = require('mongoose');
const {Schema } = mongoose;

const opts = { toJSON: { virtuals: true } };
//スキーマの定義
const spotSchema = new Schema({
  title: String,
  images: [
    {
      url: String,
      filename: String
    }
  ],
  location: String,
  aim: String,
  description: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  geometry: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, opts);

spotSchema.virtual('properties.popupMarkup').get(function () {
  return `<strong><a href="/spots/${this._id}">${this.title}</a></strong>
<p>${this.description.substring(0, 20)}...</p>`
});

//他のファイルでも使えるようにexport
module.exports = mongoose.model("Spot", spotSchema);

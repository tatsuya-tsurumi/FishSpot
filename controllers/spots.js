const Spot = require('../models/spot');
const { cloudinary } = require('../cloudinary');
const geocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = geocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const spots = await Spot.find({});
  res.render('spots/index', { spots });
};

module.exports.renderNewForm =  (req, res) => {
  res.render('spots/new');
};

module.exports.showSpot = async (req, res) => {
  const {id} = req.params;
  const spot = await Spot.findById(id)
  .populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  if(!spot) {
    req.flash('error', 'スポットが見つかりませんでした')
    return res.redirect('/spots');
  }
  res.render('spots/show', { spot });
};

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params
  const spot = await Spot.findById(id);
  if(!spot) {
    req.flash('error', 'スポットが見つかりませんでした')
    return res.redirect('/spots');
  }
  res.render('spots/edit', { spot });
}

module.exports.createSpot = async (req, res) => {
  const geoData = await geocoder.forwardGeocode( {
    query: req.body.spot.location,
    limit: 1
  }).send()
  const spot = new Spot(req.body.spot);
  spot.geometry = {
    type: 'Point',
    coordinates: geoData.body.features[0].geometry.coordinates
  }
  spot.images = req.files.map(f => ({url: f.path, filename: f.filename}));
  spot.author = req.user._id;
  await spot.save();
  console.log(spot);
  req.flash('success', '新しいスポットを登録しました');
  res.redirect(`/spots/${spot._id}`);
};

module.exports.updateSpot = async (req, res) => {
  const geoData = await geocoder.forwardGeocode( {
    query: req.body.spot.location,
    limit: 1
  }).send()
  const { id } = req.params;
  const spot = await Spot.findByIdAndUpdate(id, {...req.body.spot});
  spot.geometry = {
    type: 'Point',
    coordinates: geoData.body.features[0].geometry.coordinates
  }
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}));
  spot.images.push(...imgs);
  if(req.body.deleteImages) {
    for(let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await spot.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImages}}}});
  }
  await spot.save();
  req.flash('success', '更新が完了しました');
  res.redirect(`/spots/${spot._id}`);
};

module.exports.deleteSpot = async (req, res) => {
  const { id } = req.params;
  const spot = await Spot.findById(id);
  for(let image of spot.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  await Spot.findByIdAndDelete(id);
  req.flash('success', '削除が完了しました');
  res.redirect('/spots');
}

module.exports.showList = async (req, res) => {
  const spots = await Spot.find({});
  res.render('spots/list', { spots });
};


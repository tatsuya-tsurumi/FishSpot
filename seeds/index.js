if(process.env.NODE_ENV !== 'process') {
  require('dotenv').config();
};
const mongoose = require("mongoose");
//seedHelpers.ejsからdescription・placesを取得
const {descriptors, fishes} = require("./seedsHelpers");
//cities.ejsからcitiesの情報を取得
const cities = require("./cities");
const Spot = require("../models/spot");
const dbUrl = process.env.DB_URL ;

mongoose.connect(dbUrl)
.then(() => {
  console.log("MongoDBコネクションOK");
})
.catch(err => {
  console.log("MongoDBコネクションエラー");
  console.log(err);
});

const sample = array => array[Math.floor(Math.random() * array.length)];

await Spot.deleteMany({});
//30個のサンプルデータ作成
const seedDB = async () => {
  for(let i = 0; i < 30; i++) {
    const randomCityIndex = Math.floor(Math.random() * cities.length);
    const spot = new Spot({
      author: '67dc2c1030935d865ead4d08',
      location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
      title: `${sample(descriptors)}`,
      description: "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。またそのなかでいっしょになったたくさんのひとたち、ファゼーロとロザーロ、羊飼のミーロや、顔の赤いこどもたち、地主のテーモ、山猫博士のボーガント・デストゥパーゴなど、いまこの暗い巨きな石の建物のなかで考えていると、みんなむかし風のなつかしい青い幻燈のように思われます。では",
      geometry: {
        type: 'Point',
        coordinates: [
          cities[randomCityIndex].longitude,
          cities[randomCityIndex].latitude,
        ]
      },
      aim: `${sample(fishes)}`,
      images:  [
        {
          url: 'https://res.cloudinary.com/dhlpu00lv/image/upload/v1740789147/YelpCamp/g2brizgvcexqxnizynmg.jpg',
          filename: 'fishSpot/g2brizgvcexqxnizynmg',
        },
        {
          url: 'https://res.cloudinary.com/dhlpu00lv/image/upload/v1740789149/YelpCamp/t8y4sq8oumsv2hjn0j29.jpg',
          filename: 'fishSpot/t8y4sq8oumsv2hjn0j29',
        }
      ]
    });
    await spot.save();
  }
};


seedDB().then(() => {
  mongoose.connection.close();
});
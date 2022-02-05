require('dotenv').config();
const Clarifai = require('clarifai');

//You must add your own API key here from Clarifai. 
console.log(process.env.IMAGE_API_KEY)
const app = new Clarifai.App({
 apiKey: process.env.IMAGE_API_KEY 
});

const handleApiCall = (req, res) => {
  app.models
    // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
    // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
    // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
    // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
    // is to use a different version of their model that works like the ones found here: https://github.com/Clarifai/clarifai-javascript/blob/master/src/index.js
    // so you would change from:
    // .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    // to:
    // .predict('53e1df302c079b3db8a0a36033ed2d15', req.body.input)
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with API'))
}

const handleImage = (req, res, db) => {
  const { id } = req.body;
  console.log(id);
  db.transaction(async trx => {
    try {
      const entry = await trx('users')
      .where('id', '=', id)
      .increment('entries', 1)

      console.log(entry);

      const data = await trx
        .select(["entries"])
        .table("users")
        .where("id", "=", id)

      res.json(data[0].entries);

    } catch(e) {
      console.log(e);  // debug if needed
      res.status(400).json('unable to get entries');
    }
  });
}

module.exports = {
  handleImage,
  handleApiCall
}
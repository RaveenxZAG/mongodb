const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect('mongodb://admin:password@localhost:32000/?authMechanism=DEFAULT', (err, database) => {
  if (err) {
    return console.log(err);
  }
  db = database.db('shopping-list');
  app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000');
  });
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// GET method to fetch all shopping lists
app.get('/lists', (req, res) => {
  db.collection('lists').find().toArray((err, result) => {
    if (err) {
      return console.log(err);
    }
    res.send(result);
  });
});

// POST method to add a shopping list
app.post('/lists', (req, res) => {
  db.collection('lists').save(req.body, (err, result) => {
    if (err) {
      return console.log(err);
    }
    console.log('Saved to MongoDB');
    res.send('A shopping list item added');
  });
});

// PUT method to update a shopping list
app.put('/lists', (req, res) => {
  db.collection('lists')
    .findOneAndUpdate(
      { name: req.body.name },
      {
        $set: {
          name: req.body.name,
          list: req.body.list,
        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      },
      (err, result) => {
        if (err) {
          return res.send(err);
        }
        res.send(result);
      }
    );
});

// DELETE method to remove a shopping list
app.delete('/lists', (req, res) => {
  db.collection('lists').findOneAndDelete({ name: req.body.name }, (err, result) => {
    if (err) {
      return res.send(500, err);
    }
    res.send('A shopping list item has been deleted');
  });
});

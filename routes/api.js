/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongodb = require('mongodb');
const mongo = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;
const utils = require('./utils');
const {
    getBookFromDbResponse,
} = utils;

const BOOKS_COLLECTION = "library.books";

module.exports = function (app) {
    let db;
    mongo.connect(process.env.MONGO_URI, (err, client) => {
            if (err) {
                console.log("Database error: " + err);
            } else {
                console.log("Successful database connection");
                db = client.db(process.env.MONGO_DB);
            }
        },
    );

    app.route('/api/books')
        .get(function (req, res) {
            //response will be array of book objects
            //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        })

        .post(function (req, res) {
            //response will contain new book object including at least _id and title
            const title = req.body.title;
            if (title) {
                db.collection(BOOKS_COLLECTION)
                    .insertOne({ title })
                    .then(r => res.send(getBookFromDbResponse(r)));
            } else {
                res.status(400)
                res.send('Missing book title')
            }
        })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};

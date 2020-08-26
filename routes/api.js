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
            db.collection(BOOKS_COLLECTION)
                .find({})
                .project({ comments: 0 })
                .sort({ title: 1 })
                .limit(10000)
                .toArray()
                .then(books => res.send(books));
        })

        .post(function (req, res) {
            //response will contain new book object including at least _id and title
            const title = req.body.title;
            if (title) {
                db.collection(BOOKS_COLLECTION)
                    .insertOne({ title, comments: [], commentcount: 0 })
                    .then(r => res.send(getBookFromDbResponse(r)));
            } else {
                res.status(400)
                res.send('Missing book title')
            }
        })

        .delete(function (req, res) {
            //if successful response will be 'complete delete successful'
            db.collection(BOOKS_COLLECTION).deleteMany({}).then(r => {
                    if (r.deletedCount > 0) {
                        res.send('complete delete successful')
                    } else {
                        res.send('no books deleted')
                    }
                },
                () => {
                    res.status(400);
                    res.send('Failed to delete books')
                },
            )
        });

    const NO_BOOK_FOUND_MESSAGE = 'no book exists';

    const getBookById = (bookId, response) => {
        try {
            db.collection(BOOKS_COLLECTION)
                .findOne({ _id: ObjectId(bookId) }, { commentcount: 0 })
                .then(
                    book => response.send(book || NO_BOOK_FOUND_MESSAGE),
                    () => response.send(NO_BOOK_FOUND_MESSAGE),
                )
        } catch {
            response.send(NO_BOOK_FOUND_MESSAGE)
        }
    }

    app.route('/api/books/:id')
        .get(function (req, res) {
            const bookid = req.params.id;
            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
            getBookById(bookid, res)
        })

        .post(function (req, res) {
            const bookid = req.params.id;
            const comment = req.body.comment;
            //json res format same as .get
            try {
                db.collection(BOOKS_COLLECTION)
                    .updateOne({ _id: ObjectId(bookid) },
                        { $inc: { commentcount: 1 }, $push: { comments: comment } },
                    )
                    .then(({ modifiedCount }) => {
                            if (modifiedCount > 0) {
                                getBookById(bookid, res);
                            } else {
                                res.send(NO_BOOK_FOUND_MESSAGE)
                            }
                        },
                        () => res.send(NO_BOOK_FOUND_MESSAGE),
                    )
            } catch {
                res.send(NO_BOOK_FOUND_MESSAGE)
            }
        })

        .delete(function (req, res) {
            const bookid = req.params.id;
            //if successful response will be 'delete successful'
            try {
                db.collection(BOOKS_COLLECTION)
                    .deleteOne({ _id: ObjectId(bookid) })
                    .then(({ deletedCount }) => {
                            if (deletedCount === 1) {
                                res.send('delete successful')
                            } else {
                                res.send(NO_BOOK_FOUND_MESSAGE)
                            }
                        },
                        () => res.send(NO_BOOK_FOUND_MESSAGE),
                    )
            } catch {
                res.send(NO_BOOK_FOUND_MESSAGE)
            }
        });

};

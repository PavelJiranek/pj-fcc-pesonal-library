/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const createBook = (done, title = 'Testing book') => {
    chai.request(server)
        .post('/api/books')
        .send({ title })
        .end(function (err, res) {
            done(res.body);
        });
}

suite('Functional Tests', function () {

    suite('Routing tests', function () {

        suite('POST /api/books with title => create book object/expect book object', function () {

            test('Test POST /api/books with title', function (done) {
                chai.request(server)
                    .post('/api/books')
                    .send({
                        title: 'Title',
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        assert.equal(res.body.title, 'Title');
                        assert.isDefined(res.body._id);
                        done();
                    });
            });

            test('Test POST /api/books with no title given', function (done) {
                chai.request(server)
                    .post('/api/books')
                    .send({
                        title: '',
                    })
                    .end(function (err, res) {
                        assert.equal(res.status, 400);
                        assert.equal(res.text, 'Missing book title');
                        done();
                    });
            });

        });

        suite('GET /api/books => array of books', function () {

            test('Test GET /api/books', function (done) {
                createBook(() => { // to ensure there is at least one book to get
                    chai.request(server)
                        .get('/api/books')
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.isArray(res.body, 'response should be an array');
                            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
                            assert.property(res.body[0], 'title', 'Books in array should contain title');
                            assert.property(res.body[0], '_id', 'Books in array should contain _id');
                            done();
                        });
                });
            })
        });

        suite('GET /api/books/[id] => book object with [id]', function () {

            test('Test GET /api/books/[id] with id not in db', function (done) {
                chai.request(server)
                    .get('/api/books/invalidid')
                    .end(function (err, res) {
                        assert.equal(res.status, 200);
                        assert.equal(res.text, 'no book exists');
                        done();
                    });
            });

            test('Test GET /api/books/[id] with valid id in db', function (done) {
                const BOOK_TITLE = `book title ${new Date()}`;
                createBook(({ _id }) => {
                    chai.request(server)
                        .get(`/api/books/${_id}`)
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.equal(res.body._id, _id);
                            assert.equal(res.body.title, BOOK_TITLE);
                            done();
                        });
                }, BOOK_TITLE);
            });

        });

        suite('POST /api/books/[id] => add comment/expect book object with id', function () {

            test('Test POST /api/books/[id] with comment', function (done) {
                const TESTING_COMMENT = `new comment ${new Date()}`;
                createBook(({ _id }) => {
                    chai.request(server)
                        .post(`/api/books/${_id}`)
                        .send({
                            comment: TESTING_COMMENT,
                        })
                        .end(function (err, res) {
                            assert.equal(res.status, 200);
                            assert.equal(res.body._id, _id);
                            assert.equal(res.body.comments[0], TESTING_COMMENT);
                            done();
                        });
                });
            });
        });

    });

});

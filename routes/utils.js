const R = require('ramda');
const { path } = R;

const getBookFromDbResponse = path(['ops', 0]);


module.exports = {
    getBookFromDbResponse,
}

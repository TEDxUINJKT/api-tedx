const mongoose = require('mongoose')

async function dbConnection(MONGO_URL) {
    // database (mongo) connection
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGO_URL)
        console.log('CONNECTION SUCCESS')
    } catch (error) {
        console.log(error.message)
    };
}

module.exports = dbConnection
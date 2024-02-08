const config = require('./env')
const midtransClient = require('midtrans-client');

const {
    MIDTRANS_SERVER_KEY,
} = config

let snapMidtrans = new midtransClient.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY
});


module.exports = snapMidtrans
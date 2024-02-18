const CryptoJS = require('crypto-js');
const { SALT } = require('../config/env')
const salt = SALT

/**
 * Encrypt data using AES
 *
 * @returns string
 */

const encrypt = (data) => {
    const encryptedData = CryptoJS.AES.encrypt(data, salt).toString();
    return encryptedData;
};

/**
 * Decrypt data using AES
 *
 * @returns string
 */
const decrypt = (data) => {
    const decryptedData = CryptoJS.AES.decrypt(data, salt).toString(CryptoJS.enc.Utf8);
    return decryptedData;
};

/**
 * Generate random salt
 *
 * @returns int
 */
// const generateSalt = (length = 8) => Math.random().toString(16).substring(2, 2 + length);

module.exports = { encrypt, decrypt };

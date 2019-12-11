const AWS = require('aws-sdk');

const authenticate = (profileName) => {
    console.log(profileName);
}

module.exports = {
    authenticate: authenticate,
}
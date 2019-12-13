const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../utils');

const ssm = new AWS.SSM({region: config.region})

const getParameter = (parameterName) => {
    let params = {
        Name: parameterName,
        WithDecryption: true,
    }

    ssm.getParameter(params).promise().then((data) => {
        console.table([{'Name': data['Parameter']['Name'], 'Type': data['Parameter']['Type'], 'Value': data['Parameter']['Value']}]);
    },
    (err) => {
        console.log(err);
        throw err;
    })
}

const getParameters = () => {
    ssm.describeParameters().promise().then((data) => {
        console.table(
            data['Parameters'].map((param) => {
                return {
                    'Name': param['Name'],
                    'Type': param['Type'],
                }
            })
        )
    },
    (err) => {
        console.log(err);
        throw err;
    });
}

module.exports = {
    getParameter: getParameter,
    getParameters: getParameters,
}

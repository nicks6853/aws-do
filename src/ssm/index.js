const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../utils');

const ssm = new AWS.SSM({region: config.region})

/**
 * Retrieves info, including the value, of one parameter store item.
 * @param {string} parameterName The name of the parameter
 */
const getParameter = (parameterName) => {
    let params = {
        Name: parameterName,
        WithDecryption: true,
    }

    ssm.getParameter(params).promise().then((data) => {
        console.table([{'Name': data['Parameter']['Name'], 'Type': data['Parameter']['Type'], 'Value': data['Parameter']['Value']}]);
    },
    (err) => {
        if (err)
            console.error(err.message);
    })
}

/**
 * List all parameter store items.
 */
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
        if (err)
            console.error(err.message);
    });
}

module.exports = {
    getParameter: getParameter,
    getParameters: getParameters,
}

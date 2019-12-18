const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../utils');

const ssm = new AWS.SSM({region: config.region});

/**
 * Retrieves info, including the value, of one parameter store item.
 * @param {string} parameterName The name of the parameter
 */
const getParameter = (parameterName) => {
    let params = {
        Name: parameterName,
        WithDecryption: true,
    };

    ssm.getParameter(params).promise().then((data) => {
        console.table([{'Name': data['Parameter']['Name'], 'Type': data['Parameter']['Type'], 'Value': data['Parameter']['Value']}]);
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
};

/**
 * List all parameter store items.
 * Loop is necessary if there are more than 50 parameters.
 * Cannot fetch more than 50 parameters at once from AWS.
 */
const getParameters = async () => {
    let ssmParameters = new Array();
    nextToken = null;
    do {
        let params = {
            MaxResults: 50,
            NextToken: nextToken,
        };

        await ssm.describeParameters(params).promise().then((data) => {
            nextToken = data['NextToken'] ? data['NextToken'] : -1;
            data['Parameters'].map((param) => {
                ssmParameters.push({
                    'Name': param['Name'],
                    'Type': param['Type'],
                });
            });
        },
        (err) => {
            if (err)
                console.error(err.message);
        }); 
    } while (nextToken != -1);

    console.table(ssmParameters);
};

module.exports = {
    getParameter: getParameter,
    getParameters: getParameters,
}

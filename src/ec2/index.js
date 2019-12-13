const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../utils');

const ec2 = new AWS.EC2({region: config.region});

/**
 * List all the EC2 Instances.
 */
const getInstances = () => {
    ec2.describeInstances().promise().then((data) => {
        const instances = new Array();
        data['Reservations'].map((reservation) => {
            reservation['Instances'].map((instance) => {
                let instanceName = instance['Tags'].filter((item) => item['Key'] == 'Name')[0]['Value'];
                instances.push({
                    'Name': instanceName ? instanceName : null,
                    'InstanceId': instance['InstanceId'],
                    'InstanceType': instance['InstanceType'],
                    'PublicDnsName': instance['PublicDnsName'] ? instance['PublicDnsName'] : null,
                    'PrivateIpAddress': instance['PrivateIpAddress'] ? instance['PrivateIpAddress'] : null,
                });
            });
        });
        console.table(instances);
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
}

/**
 * Filters the results of getInstances by tag:Name
 * @param {string} instanceName Filter value for the 'Name' tag on the instances. 
 */
const getInstance = (instanceName) => {
    let params = {
        Filters: [{ Name: "tag:Name", Values: [`*${instanceName}*` ]}],
    };
    ec2.describeInstances(params).promise().then((data) => {
        const instances = new Array();
        data['Reservations'].map((reservation) => {
            reservation['Instances'].map((instance) => {
                let instanceName = instance['Tags'].filter((item) => item['Key'] == 'Name')[0]['Value'];
                instances.push({
                    'Name': instanceName ? instanceName : null,
                    'InstanceId': instance['InstanceId'],
                    'InstanceType': instance['InstanceType'],
                    'PublicDnsName': instance['PublicDnsName'] ? instance['PublicDnsName'] : null,
                    'PrivateIpAddress': instance['PrivateIpAddress'] ? instance['PrivateIpAddress'] : null,
                });
            });
        });
        console.table(instances);
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
}

module.exports = {
    getInstances: getInstances,
    getInstance: getInstance,
}

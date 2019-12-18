const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../utils');
const child_process = require('child_process');

const ec2 = new AWS.EC2({ region: config.region });
const ssm = new AWS.SSM({ region: config.region });

/**
 * Filters the results of getInstances by tag:Name
 * @param {string} instanceName Filter value for the 'Name' tag on the instances. 
 */
const getInstances = (filter) => {
    let params = {};
    if (filter)
        params['Filters'] = [{ Name: "tag:Name", Values: [`*${filter}*` ]}];

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
        instances.sort((a, b) => {
            return a['Name'].localeCompare(b['Name']);
        });
        console.table(instances);
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
};

const session = (instanceId) => {
    let currentSession = child_process.spawn('aws', ['ssm', 'start-session', '--target', instanceId], { stdio: 'inherit' });
    currentSession.on('close', (code) => {
        console.log("Done.");
    });
};

module.exports = {
    getInstances: getInstances,
    session: session,
};

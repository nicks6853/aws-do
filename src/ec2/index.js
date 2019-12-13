const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../utils');
const child_process = require('child_process');

const ec2 = new AWS.EC2({region: config.region});

/**
 * List all the EC2 Instances.
 */
const getInstances = () => {
    ec2.describeInstances().promise().then((data) => {
        const instances = new Array();
        data['Reservations'].map((reservation) => {
            reservation['Instances'].filter(instance => instance['State']['Name'] === "running").map((instance) => {
                let instanceName = instance['Tags'].filter((item) => item['Key'] == 'Name')[0]['Value'];
                instances.push({
                    'Name':  instanceName,
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

const session = (instanceId) => {
    let params = {
        InstanceIds: [ instanceId ],
    }

    ec2.describeInstances(params).promise().then(async (data) => {
        let bastionPublicDNSName = 'ec2-15-222-1-153.ca-central-1.compute.amazonaws.com';
        let cidrBlock = null;
        let instance = data['Reservations'][0]['Instances'][0];
        let instancePrivateIp = instance['PrivateIpAddress'];
        let username = process.env['USER'];
        let vpcId = instance['VpcId'];
        let params = {
            VpcIds: [ vpcId ],
        };
        await ec2.describeVpcs(params).promise().then((data) =>{
            cidrBlock = data['Vpcs'][0]['CidrBlock'];
            console.log(cidrBlock);
        },
        (err) => {
            if (err)
                console.error(err.message);
        })

        let child = child_process.spawn('sshuttle', ['-r', `${username}@${bastionPublicDNSName}`, cidrBlock], {stdio: 'inherit'});
        child.on('close', function () {
            console.log("Done");
        });
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
}

module.exports = {
    getInstances: getInstances,
    getInstance: getInstance,
    session: session,
}

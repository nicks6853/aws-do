const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../utils');
const child_process = require('child_process');

const ec2 = new AWS.EC2({ region: config.region });
const ssm = new AWS.SSM({ region: config.region });

/**
 * Filters the results of getInstances by tag:Name
 * @param {string} instanceName Filter value for the 'Name' tag on the instances
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


/**
 * Returns the state and progress of the snapshot
 * @param {string} snapshotId The ID of Snapshot
 */
const getSnapshotStatus = (snapshotId) => {
    let params = {
        SnapshotIds: [ snapshotId ],
    };

    return new Promise((resolve, reject) => {
        ec2.describeSnapshots(params).promise().then((data) => {
            resolve({ 'State': data['Snapshots'][0]['State'], 'Progress': data['Snapshots'][0]['Progress'] });
        },
        (err) => {
            if (err) {
                console.error(err.message);
                reject({ 'Status': 'error', 'Message': err.message });
            }
        });
    });
}

/**
 * Takes a snapshot of the EBS volumes attached to the instance specified
 * @param {string} instanceId ID of the instance for which we'll take a snapshot of the EBS volume attached
 * @param {string} description Description of the EBS snapshot
 */
const ebsSnapshot = (instanceId, description) => {
    let params = {
        InstanceId: instanceId,
        Attribute: 'blockDeviceMapping',
    };

    ec2.describeInstanceAttribute(params).promise().then((data) => {
        data['BlockDeviceMappings'].map((blockDevice) => {
            let params = {
                Description: description,
                VolumeId: blockDevice['Ebs']['VolumeId'],
            };
            ec2.createSnapshot(params).promise().then(async (data) => {
                console.log('Creating snapshot...');
                let state = data['State'];

                while (state !== 'completed') {
                    let response = await getSnapshotStatus(data['SnapshotId']);
                    state = response['State'];
                    progress = response['Progress'];
                    process.stdout.clearLine();  // Clear current text
                    process.stdout.cursorTo(0); // Move cursor to the left
                    process.stdout.write(`Progress: ${progress}`);
                    await utils.sleep(5000);
                }
            },
            (err) => {
                if (err)
                    console.error(err.message);
            });
        });
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
};

/**
 * Creates a session on an instance using session manager
 * @param {string} instanceId ID of the instance we want to create a session with
 */
const session = (instanceId) => {
    let currentSession = child_process.spawn('aws', ['ssm', 'start-session', '--target', instanceId], { stdio: 'inherit' });
    currentSession.on('close', (code) => {
        console.log("Done.");
    });
};

module.exports = {
    ebsSnapshot: ebsSnapshot,
    getInstances: getInstances,
    session: session,
};

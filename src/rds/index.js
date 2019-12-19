const AWS = require('aws-sdk');
const config = require('../../config');
const uuid = require('uuid');
const utils = require('../utils');

const rds = new AWS.RDS({region: config.region});

/**
 * List all the RDS Instances.
 */
const describeDBInstances = () => {
    let params = { MaxRecords: 100 };
    rds.describeDBInstances(params).promise().then((data) => {
        console.table(
            data['DBInstances'].map(rdsInstance => {
                return {
                    'DBInstanceIdentifier': rdsInstance['DBInstanceIdentifier'],
                    'DBInstanceClass': rdsInstance['DBInstanceClass'],
                    'Endpoint': rdsInstance['Endpoint']['Address'],
                };
            })
        );
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
};

/**
 * Get the attributes of an RDS Instance.
 * @param {String} dbInstanceIdentifier DB Instance Identifier
 */
const describeDBInstance = (dbInstanceIdentifier) => {
    let params = {
        DBInstanceIdentifier: dbInstanceIdentifier,
    };
    rds.describeDBInstances(params).promise().then((data) => {
        console.table(
            data['DBInstances'].map(rdsInstance => {
                return {
                    'DBInstanceIdentifier': rdsInstance['DBInstanceIdentifier'],
                    'DBInstanceClass': rdsInstance['DBInstanceClass'],
                    'Endpoint': rdsInstance['Endpoint']['Address'],
                    'MultiAZ': rdsInstance['MultiAZ'],
                    'DeletionProtection': rdsInstance['DeletionProtection'],
                    'DBInstanceStatus': rdsInstance['DBInstanceStatus'],
                };
            })
        );
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
};

/**
 * Creates a snapshot of the database specified using the dbInstanceIdentifier param.
 * @param {String} dbInstanceIdentifier 
 */
const createDBSnapshot = (dbInstanceIdentifier) => {
    let dbSnapshotIdentifier = `${dbInstanceIdentifier}-${uuid.v4()}`;
    let params = {
        DBInstanceIdentifier: dbInstanceIdentifier,
        DBSnapshotIdentifier: dbSnapshotIdentifier,
    };

    rds.createDBSnapshot(params).promise().then(async (data) => {
        let response = await getDBSnapshotStatus(dbInstanceIdentifier, dbSnapshotIdentifier);
        process.stdout.write(`Creating DB Snapshot: ${dbSnapshotIdentifier}`);
        
        while (response['Status'] !== 'available') {
            process.stdout.write('.');
            response = await getDBSnapshotStatus(dbInstanceIdentifier, dbSnapshotIdentifier);
            await utils.sleep(3000);
        }
        console.log('\nDone!');
    },
    (err) => {
        console.log(err.message);
    });
};

/**
 * Returns the status of the DB Snapshot.
 * @param {String} dbInstanceIdentifier DB Instance Identifier
 * @param {String} dbSnapshotIdentifier DB Snapshot Identifier
 */
const getDBSnapshotStatus = (dbInstanceIdentifier, dbSnapshotIdentifier) => {
    let params = {
        DBInstanceIdentifier: dbInstanceIdentifier,
        DBSnapshotIdentifier: dbSnapshotIdentifier,
    };
    return new Promise((resolve, reject) => {
        rds.describeDBSnapshots(params).promise().then((data) => {
            resolve({ 'Status': data['DBSnapshots'][0]['Status'] });
        },
        (err) => {
            if (err)
                console.error(err.message);
                reject({ 'Status': 'error', 'Message': err.message });
        });
    });
};

module.exports = {
    createDBSnapshot: createDBSnapshot,
    describeDBInstance: describeDBInstance,
    describeDBInstances: describeDBInstances,
};

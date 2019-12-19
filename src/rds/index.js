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
const createDBSnapshot = async (dbInstanceIdentifier) => {
    let dbSnapshotIdentifier = `${dbInstanceIdentifier}-${uuid.v4()}`;
    let params = {
        DBInstanceIdentifier: dbInstanceIdentifier,
        DBSnapshotIdentifier: dbSnapshotIdentifier,
    };

    await rds.createDBSnapshot(params).promise().then(async (data) => {
        let status = await describeDBSnapshotStatus(dbInstanceIdentifier, dbSnapshotIdentifier);
        process.stdout.write(`Creating DB Snapshot: ${dbSnapshotIdentifier}`);
        
        while (status !== 'available') {
            process.stdout.write('.');
            if (!status) {
                console.error("\nProblem during creation of the snapshot");
                return;
            }
            await utils.sleep(3000);
            status = await describeDBSnapshotStatus(dbInstanceIdentifier, dbSnapshotIdentifier);
        }
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
const describeDBSnapshotStatus = async (dbInstanceIdentifier, dbSnapshotIdentifier) => {
    let params = {
        DBInstanceIdentifier: dbInstanceIdentifier,
        DBSnapshotIdentifier: dbSnapshotIdentifier,
    };
    let status = null;
    await rds.describeDBSnapshots(params).promise().then((data) => {
        status = data['DBSnapshots'][0]['Status'];
    },
    (err) => {
        if (err)
            console.error(err.message);
    });
    return status;
}

module.exports = {
    createDBSnapshot: createDBSnapshot,
    describeDBInstance: describeDBInstance,
    describeDBInstances: describeDBInstances,
    describeDBSnapshotStatus: describeDBSnapshotStatus,
};

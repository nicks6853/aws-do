const ec2 = require('./ec2');
const rds = require('./rds');
const ssm = require('./ssm');
const commander = require('commander');


const main = async () => {
    commander
        .version('1.0.0')
        .description('aws-do');

    /**
     * RDS Functionalities
     */
    commander
        .command('db-snapshot <dbInstanceIdentifier>')
        .description('Take an RDS Snapshot')
        .action(async (dbInstanceIdentifier) => {
            await rds.createDBSnapshot(dbInstanceIdentifier);
        });
    commander
        .command('list-dbs')
        .description('List RDS Instances')
        .action(() => {
            rds.describeDBInstances();
        });
    commander
        .command('get-db <dbInstanceIdentifier>')
        .description('Describe RDS Instance')
        .action((dbInstanceIdentifier) => {
            rds.describeDBInstance(dbInstanceIdentifier);
        });

    /**
     * SSM Functionalities
     */
    commander
        .command('list-params')
        .description('Retrieve Parameters from Parameter Store')
        .action(async () => {
            await ssm.getParameters();
        });
    commander
        .command('get-param <parameterName>')
        .description('Retrieve Parameter from Parameter Store')
        .action((parameterName) => {
            ssm.getParameter(parameterName);
        });

    /**
     * EC2 Functionalities
     */
    commander
        .command('list-instances [filter]')
        .description('List EC2 Instances')
        .action((filter) => {
            ec2.getInstances(filter);
        });
    commander
        .command('ebs-snapshot <instanceId> [description]')
        .description('Take a snapshot of the EBS volume attached to an instance.')
        .action((instanceId, description) => {
            ec2.ebsSnapshot(instanceId, description);
        });
    commander
        .command('session <instanceId>')
        .description('SSH into an instance')
        .action((instanceId) => {
            ec2.session(instanceId);
        });

    commander.parse(process.argv);
};

main();
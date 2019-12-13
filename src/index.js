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
        .action(() => {
            ssm.getParameters();
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
        .command('list-instances')
        .description('List EC2 Instances')
        .action(() => {
            ec2.getInstances();
        });
    commander
        .command('get-instance <instanceName>')
        .description('List EC2 Instances (Filtered)')
        .action((instanceName) => {
            ec2.getInstance(instanceName);
        });

    commander.parse(process.argv);
};

main();
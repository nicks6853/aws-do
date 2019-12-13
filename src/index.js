const rds = require('./rds');
const ssm = require('./ssm');
const commander = require('commander');


const main = async () => {
    commander
        .version('1.0.0')
        .description('aws-do');

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

    commander.parse(process.argv);
};

main();
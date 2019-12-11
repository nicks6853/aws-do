const rds = require('./rds');
const commander = require('commander');


const main = async () => {
    commander
        .version('1.0.0')
        .description('do');

    commander
        .command('db-snapshot <dbInstanceIdentifier>')
        .description('Take an RDS Snapshot')
        .action(async (dbInstanceIdentifier) => {
            await rds.createDBSnapshot(dbInstanceIdentifier);
        });
    commander
        .command('dbs')
        .description('List RDS Instances')
        .action(() => {
            rds.describeDBInstances();
        });
    commander
        .command('db <dbInstanceIdentifier>')
        .description('Describe RDS Instance')
        .action((dbInstanceIdentifier) => {
            rds.describeDBInstance(dbInstanceIdentifier);
        });

    commander.parse(process.argv);
};

main();
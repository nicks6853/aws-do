const rds = require('./rds');
const auth = require('./auth');

const args = {}
process.argv.forEach((val, index, array) => {
    if (index % 2 == 0)
        args[val] = null;
    else
        args[array[index-1]] = val;
});

const main = async () => {
    await rds.createDBSnapshot(argv['--db-id']);
}

if (!args['--db-id']) {
    console.error("Please enter a value for --db-id");
    return;
}
main();

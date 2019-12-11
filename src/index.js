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
    await rds.createDBSnapshot('nbjobs-dev');
    // console.log(await rds.getDBSnapshotStatus('nbjobs-stage', 'nbjobs-stage-6d9cee1a-0649-4ecb-a54a-299b9b5f8dc3'));
}

main();

// Polyfills
import 'reflect-metadata';
// End of polyfills
import { BankAccountRepository } from './../samples/src/services/bank-repository';

try {
    const program = new BankAccountRepository();

    const streamID = program.saveAggregate();

    const aggregate = program.getAggregate(streamID);

    console.log(aggregate);

} catch (err) {
    console.log('Some Exception', err);
    process.exit(0);
}



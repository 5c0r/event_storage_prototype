// Polyfills
import 'reflect-metadata';
// End of polyfills

import * as Mongoose from 'mongoose';
import { injectable, inject } from 'inversify';

import { BankAccount } from './src/model';

import { Repository } from '@core/infrastructure/interface/storage/repository';
import { EventStorage } from '@core/engine/base-repository';
import { BaseMongooseInstance, MongooseInstance } from '@core/infrastructure/interface/storage/mongoInstance';

const connString = 'mongodb://192.168.1.144:27017/event_storage';

const Injections = {
    ConnectionString: connString
}

// Enum , Id generation strategy
enum IdentifierStrategy {
    Default = 0,
    Advanced = 1
}

@injectable()
export class MainProgram {
    private readonly mongooseInstance: MongooseInstance = new BaseMongooseInstance(connString);
    private readonly repository: EventStorage<BankAccount> = new EventStorage(this.mongooseInstance, BankAccount);

    constructor() {
        console.log('mongooseInstance', this.mongooseInstance);
        this.mongooseInstance.initialize();
    }

    saveAggregate() {
        const newAggregate = new BankAccount();

        for (let i = 0; i < 10; i++) {
            const random = () => Math.random() * i;
            newAggregate.deposit(random()).setName(`Name ${random()}`);
        }

        this.repository.startStream(newAggregate);
    }

    getAggregate(streamId: any) {
        this.repository.getStreamState(streamId)
            .subscribe(streamState => console.log('StreamState', streamState))

        this.repository.getStream(streamId)
            .subscribe(aggregate => console.log('Aggregate', aggregate))
    }

    getAggregateWithMapReduce(streamId: any) {
        this.repository.getStreamWithMapReduce(streamId)
            .subscribe(stream => console.log('GetStreamWIthMapReduce', stream));
    }

    appendAggregate(streamId: any) {
        console.log('getting stream to append streamId', streamId);
        const stream$ = this.repository.getStream(streamId).subscribe((res) => {
            res.setName('Hello guys');
            res.deposit(10);

            this.repository.saveStream(res);
        })
    }

}

try {
    const program = new MainProgram();

    // program.saveAggregate();

    // program.getAggregateWithMapReduce('5a089b86fe1985453cece451');

    // program.appendAggregate('59b58c8862b75d3db4695cbe');

    program.getAggregate('5a08b662db099920643dd56a');

} catch (err) {
    console.log('Some Exception', err);
    process.exit(0);
}



// Polyfills
import 'reflect-metadata';
// End of polyfills

import * as Mongoose from 'mongoose';
import { injectable, inject } from 'inversify';

import { BankAccount } from './test_samples';

import { IRepository } from './../src/infrastructure/interface/storage/IRepository';
import { BaseRepository } from './../src/engine/BaseRepository';
import { BaseMongooseInstance, IMongooseInstance } from './../src/infrastructure/interface/storage/IMongoInstance';

const connString = 'mongodb://localhost:27017/event_storage';

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
    private readonly mongooseInstance: IMongooseInstance = new BaseMongooseInstance(connString);
    private readonly repository: BaseRepository<BankAccount> = new BaseRepository(this.mongooseInstance, BankAccount);

    constructor() {
        console.log('mongooseInstance', this.mongooseInstance);
        this.mongooseInstance.initialize();
    }

    saveAggregate() {
        const newAggregate = new BankAccount();

        for (let i = 0; i < 10000; i++) {
            const random = () => Math.random() * i;
            newAggregate.deposit(random()).setName(`Name ${random()}`);
        }

        this.repository.StartStream(newAggregate);
    }

    getAggregate(streamId: any) {
        this.repository.GetStreamState(streamId)
            .subscribe(streamState => console.log('StreamState', streamState))

        this.repository.GetStream(streamId)
            .subscribe(aggregate => console.log('Aggregate', aggregate))
    }

    getAggregateWithMapReduce(streamId: any) {
        this.repository.GetStreamWithMapReduce(streamId)
            .subscribe(stream => console.log('GetStreamWIthMapReduce', stream));
    }

    appendAggregate(streamId: any) {
        console.log('getting stream to append streamId', streamId);
        let stream$ = this.repository.GetStream(streamId).subscribe((res) => {
            res.setName('Hello guys');
            res.deposit(10);

            this.repository.SaveStream(res);
        })
    }

}

try {
    const program = new MainProgram();

    // program.saveAggregate();

    program.getAggregateWithMapReduce('59b58e5773e13d3584bf6d40');

    // program.appendAggregate('59b58c8862b75d3db4695cbe');

    // program.getAggregate('59b12a662c09642b64fb541c');

} catch (err) {
    console.log('Some Exception', err);
    process.exit(0);
}



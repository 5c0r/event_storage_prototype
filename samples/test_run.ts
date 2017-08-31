// Polyfills
import 'reflect-metadata';
// End of polyfills

import * as Mongoose from 'mongoose';
import { injectable, inject } from 'inversify';

import { MyAggregate } from './test_samples';

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
class MainProgram {
    private readonly mongooseInstance: IMongooseInstance = new BaseMongooseInstance(connString);
    private readonly repository: IRepository<MyAggregate> = new BaseRepository(this.mongooseInstance, MyAggregate);

    constructor() {
        console.log('mongooseInstance', this.mongooseInstance);
        this.mongooseInstance.initialize();
    }

    saveAggregate() {
        const newAggregate = new MyAggregate();

        for (let i = 0; i < 300; i++) {
            const random = () => Math.random() * i;
            newAggregate.setValue(random()).setString(`${random()} Name ${random()}`);
        }

        console.log('NewAggregate uncommitted events', newAggregate.UncommittedEvents);
        console.log('NewAggreagte testProperty = ', newAggregate.Name, newAggregate.TestProperty);

        this.repository.StartStream(newAggregate).subscribe(
            res => {
                console.log('save succes', res);
                this.getAggregate(newAggregate._id);

            },
            err => console.log('StartStream err', err));
    }

    getAggregate(streamId: any) {
        this.repository.GetStreamState(streamId)
            .subscribe(streamState => console.log('StreamState', streamState))

        this.repository.GetStream(streamId, 400)
            .subscribe(aggregate => console.log('Aggregate', aggregate))

        // this.repository.GetEvents(streamId).subscribe(
        //     events => console.log(events.length, 'Events', events)
        // )
    }

    appendAggregate(streamId: any) {

    }

}

try {
    const program = new MainProgram();
    program.saveAggregate();
} catch (err) {
    console.log('Some Exception', err);
    process.exit(0);
}



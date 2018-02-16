import { IRead, IWrite } from '.';
import { BankAccount } from '../model';

import { Repository } from 'core/infrastructure/interface/storage/repository';
import { EventStorage } from 'core/engine/base-repository';
import { BaseMongooseInstance, MongooseInstance } from 'core/infrastructure/interface/storage/mongo-instance';
import { ObjectId } from 'bson';

const connString = 'mongodb://192.168.1.144:27017/event_storage';

export class BankAccountRepository implements IRead, IWrite {

    private readonly mongooseInstance: MongooseInstance = new BaseMongooseInstance(connString);
    private readonly repository: EventStorage<BankAccount> = new EventStorage(this.mongooseInstance, BankAccount);

    constructor() {
        this.mongooseInstance.initialize();
    }

    saveAggregate(): ObjectId {
        const newAggregate = new BankAccount();

        for (let i = 0; i < 10; i++) {
            const random = () => Math.random() * i;
            newAggregate.deposit(random()).setName(`Name ${random()}`);
        }

        const streamId = this.repository.startStream(newAggregate);
        console.log(`Newly created streamId ${streamId}`);

        return streamId;
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

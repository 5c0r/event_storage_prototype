import { IReadBankAccount, IWriteBankAccount } from '.';
import { BankAccount } from '../model';

import { ObjectId } from 'bson';
import { MongooseInstance, BaseMongooseInstance } from '../../../src/infrastructure/interface/storage/mongo-instance';
import { EventStorage } from '../../../src';
import { CreateBankAccountHandler } from 'src/component/handler/create-bank-account';
import { AccountCreated, AccountDeposited, AccountWithdrawed } from 'src/model/bank-account-events';
import * as Mongoose from 'mongoose';
import { fromPromise } from 'rxjs/internal-compatibility';
import { AccountTotalDeposit } from 'src/model/projection/total-deposit';
import { CurrentBalance } from 'src/model/projection/current-balance';

const connString = 'mongodb://127.0.0.1:27017/event_storage';

export class BankAccountRepository implements IReadBankAccount, IWriteBankAccount {

    private readonly mongooseInstance: MongooseInstance = new BaseMongooseInstance(connString);
    private readonly eventStore: EventStorage<BankAccount>;

    // TODO: This can be improved with a good dependency injection
    constructor() {
        this.mongooseInstance.initialize();
        this.eventStore = new EventStorage(this.mongooseInstance, BankAccount);
    }

    saveAggregate(): ObjectId {
        const newAggregate = new BankAccount();

        for (let i = 0; i < 10; i++) {
            const random = () => Math.random() * i;
            newAggregate.deposit(random()).setName(`Name ${random()}`);
        }

        const streamId = this.eventStore.startStream(newAggregate);
        console.log(`Newly created streamId ${streamId}`);

        return streamId;
    }

    createBankAccount(): ObjectId {
        const newAccountAggregate = new BankAccount({ accountName: 'Test', startBalance: 100000 });
        const streamId = this.eventStore.startStream(newAccountAggregate);

        return streamId;
    }

    createBankAccountWithEvents(): ObjectId {
        const newAccountEvent = new AccountCreated('Test Account', 100000, new Date());
        const streamId = this.eventStore.startStreamWithEvents([newAccountEvent]);

        return streamId;
    }

    getBankTransactionEvents(streamId: string): any {
        const results = this.eventStore.getEventsByTypes(streamId, [AccountDeposited.name, AccountWithdrawed.name])
            .toPromise();

        return results;
    }

    async getBankTotalDepositProjection(userId: string) {
        const events = await this.eventStore.getEvents(userId).toPromise();

        const depositProjection = new AccountTotalDeposit(userId);
        events.forEach(ev => depositProjection.ApplyEvent(ev));

        return depositProjection;
    }

    async getBankCurrentBalanceProjection(userId: string) {
        const events = await this.eventStore.getEvents(userId).toPromise();

        const currentBalance = new CurrentBalance(userId);
        events.forEach(ev => currentBalance.ApplyEvent(ev));

        return currentBalance;
    }

    getAggregate(streamId: any) {
        // TODO
        // this.repository.getStreamState(streamId)
        //     .subscribe(streamState => console.log('StreamState', streamState))

        this.eventStore.getStream(streamId)
            .subscribe(aggregate => console.log('Aggregate', aggregate))
    }

    getAggregateWithMapReduce(streamId: any) {
        this.eventStore.getStreamWithMapReduce(streamId)
            .subscribe(stream => console.log('GetStreamWIthMapReduce', stream));
    }

    // Don't use this
    appendAggregate(streamId: any) {
        console.log('getting stream to append streamId', streamId);
        const stream$ = this.eventStore.getStream(streamId).subscribe((res) => {
            res.setName('Hello guys');
            res.deposit(10);

            this.eventStore.saveStream(res);
        })
    }

}

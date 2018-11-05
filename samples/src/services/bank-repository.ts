import { IRead, IWrite } from '.';
import { BankAccount } from '../model';

import { ObjectId } from 'bson';
import { MongooseInstance, BaseMongooseInstance } from '../../../src/infrastructure/interface/storage/mongo-instance';
import { EventStorage } from '../../../src';
import { CreateBankAccountHandler } from 'src/component/handler/create-bank-account';
import { AccountCreated, AccountDeposited, AccountWithdrawed } from 'src/model/bank-account-events';
import * as Mongoose from 'mongoose';
import { fromPromise } from 'rxjs/internal-compatibility';
import { BankTotalDeposit } from 'src/model/projection/total-deposit';
import { BankAccountBalance } from 'src/model/projection/current-balance';

const connString = 'mongodb://127.0.0.1:27017/event_storage';

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

    createBankAccount(): ObjectId {
        const newAccountAggregate = new BankAccount({ accountName: 'Test', startBalance: 100000 });
        const streamId = this.repository.startStream(newAccountAggregate);

        return streamId;
    }

    createBankAccountWithEvents(): ObjectId {
        const newAccountEvent = new AccountCreated('Test Account', 100000, new Date());
        const streamId = this.repository.startStreamWithEvents([newAccountEvent]);

        return streamId;
    }

    getBankTransactionEvents(streamId: string): any {
        const results = this.repository.getEventsByTypes(streamId, [AccountDeposited.name, AccountWithdrawed.name])
            .toPromise();

        return results;
    }

    async getBankTotalDepositProjection(userId: string) {
        const events = await this.repository.getEvents(userId).toPromise();

        const depositProjection = new BankTotalDeposit(userId);
        events.forEach( ev => depositProjection.ApplyEvent(ev));

        return depositProjection;
    }

    async getBankCurrentBalanceProjection(userId: string) {
        const events = await this.repository.getEvents(userId).toPromise();

        const currentBalance = new BankAccountBalance(userId);
        events.forEach( ev => currentBalance.ApplyEvent(ev));

        return currentBalance;
    }

    getAggregate(streamId: any) {
        // TODO
        // this.repository.getStreamState(streamId)
        //     .subscribe(streamState => console.log('StreamState', streamState))

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

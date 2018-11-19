import { IReadBankAccount, IWriteBankAccount } from '.';
import { BankAccount } from '../model';

import { ObjectId } from 'bson';
import { MongooseInstance, BaseMongooseInstance } from '../../../src/infrastructure/interface/storage/mongo-instance';
import { EventStorage } from '../../../src';
import { AccountCreated, AccountDeposited, AccountWithdrawed } from './../model/bank-account-events';
import { AccountTotalDeposit } from './../model/projection/total-deposit';
import { Service } from 'typedi';
import { CurrentBalance } from './../model/projection/current-balance';
import { TransactionHistory } from './../model/projection/transaction-history';

const connString = 'mongodb://127.0.0.1:27017/event_storage';

@Service()
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

    // Start of IWriteBankAccount
    createBankAccount(name: string, amount: number): ObjectId {
        const newAccountAggregate = new BankAccount();
        newAccountAggregate.createBankAccount(name, amount);
        const streamId = this.eventStore.startStream(newAccountAggregate);

        return streamId;
    }

    createBankAccountWithEvents(name: string, amount: number): ObjectId {
        const newAccountEvent = new AccountCreated(name, amount, new Date());
        const streamId = this.eventStore.startStreamWithEvents([newAccountEvent]);

        return streamId;
    }

    depositAccount(accountId: any, amount: number, reason?: string): void {
        const depositEvent = new AccountDeposited(amount, reason);
        this.eventStore.appendStream(accountId, [depositEvent]);
    }

    withdrawAccount(accountId: any, amount: number, reason?: string): void {
        const withdrawEvent = new AccountWithdrawed(amount, reason);
        this.eventStore.appendStream(accountId, [withdrawEvent]);
    }

    transferMoney(fromAccount: any, toAccount: any, amount: number): void {
        const reason = `Transfer from ${amount} euros ${fromAccount} to ${toAccount}`;
        this.withdrawAccount(fromAccount, amount, reason);
        this.depositAccount(toAccount, amount, reason);
    }

    // TODO
    deactivateAccount(accountId: any, reason: string): void {

    }
    activateAccount(accountId: any, reason: string): void {

    }
    // End of IWriteBankAccount implementation

    getBankTransactionEvents(streamId: string): any {
        const results = this.eventStore.getEventsByTypes(streamId, [AccountDeposited.name, AccountWithdrawed.name])
            .toPromise();

        return results;
    }

    async getBankTransactionProjection(userId: string): Promise<TransactionHistory> {
        const events = await this.eventStore.getEvents(userId).toPromise();

        const transactionProjection = new TransactionHistory(userId);
        events.forEach((ev: any) => transactionProjection.ApplyEvent(ev.Data, ev.Type));

        return transactionProjection;
    }

    async getBankTotalDepositProjection(userId: string): Promise<AccountTotalDeposit> {
        const events = await this.eventStore.getEvents(userId).toPromise();

        const depositProjection = new AccountTotalDeposit(userId);
        events.forEach(ev => {
            depositProjection.ApplyEvent(ev)
        });

        return depositProjection;
    }

    async getBankCurrentBalanceProjection(userId: string): Promise<CurrentBalance> {
        const events = await this.eventStore.getEvents(userId).toPromise();

        const currentBalance = new CurrentBalance(userId);
        events.forEach((ev: any) => {
            if (ev) {
                currentBalance.ApplyEvent(ev.Data, ev.Type)
            };
        });
        return Promise.resolve(currentBalance);
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
    }

}

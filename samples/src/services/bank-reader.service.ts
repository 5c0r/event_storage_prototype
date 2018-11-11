import { IReadBankAccount } from ".";

export class BankReaderService implements IReadBankAccount {
    getAggregate(userId: any) {
        throw new Error("Method not implemented.");
    } getAggregateWithMapReduce(userId: any) {
        throw new Error("Method not implemented.");
    }
    getBankTransactionEvents(userId: any) {
        throw new Error("Method not implemented.");
    }
    getBankTotalDepositProjection(userId: string) {
        throw new Error("Method not implemented.");
    }
    getBankCurrentBalanceProjection(userId: string) {
        throw new Error("Method not implemented.");
    }
}
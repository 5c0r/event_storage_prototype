export interface IReadBankAccount {
    getAggregate(userId: any): any;
    getAggregateWithMapReduce(userId: any): any;

    getBankTransactionEvents(userId: any): any;

    getBankTotalDepositProjection(userId: string): any;
    getBankCurrentBalanceProjection(userId: string): any;
}

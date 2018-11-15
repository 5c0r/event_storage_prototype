import { ObjectId } from "bson";

export interface IWriteBankAccount {
    createBankAccount(name: string, amount: number): ObjectId;
    createBankAccountWithEvents(name: string, amount: number): ObjectId;

    depositAccount(accountId: any, amount: number): void;
    withdrawAccount(accountId: any, amount: number): void;
    transferMoney(fromAccount: any, toAccount: any, amount: number): void;

    deactivateAccount(accountId: any, reason: string): void;
    activateAccount(accountId: any, reason: string): void;
}

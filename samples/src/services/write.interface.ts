import { ObjectId } from "bson";

export interface IWriteBankAccount {
    createBankAccount(): ObjectId;
    createBankAccountWithEvents(): ObjectId;

    deactivateAccount(accountId: any, reason: string): void;
    activateAccount(accountId: any, reason: string): void;
}

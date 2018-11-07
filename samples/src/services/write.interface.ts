import { ObjectId } from "bson";

export interface IWriteBankAccount {
    createBankAccount(): ObjectId;
    createBankAccountWithEvents(): ObjectId;
}

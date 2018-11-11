import { IWriteBankAccount } from ".";
import { ObjectId } from "bson";

export class BankWriterService implements IWriteBankAccount {
    createBankAccount(): ObjectId {
        throw new Error("Method not implemented.");
    }
    createBankAccountWithEvents(): ObjectId {
        throw new Error("Method not implemented.");
    }
}

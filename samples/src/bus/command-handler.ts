import { IWriteBankAccount } from './../services/write.interface';
import { BankAccountRepository } from './../services/bank-repository';
import { CreateCommand, DepositCommand, TransferCommand } from './interface/command.interface';
import { Service } from 'typedi';

@Service()
export class ReadCommandHandler {

    // Make sure we don't use any read method here
    bankWriteSvc: IWriteBankAccount;

    readonly commandRouter = {
        'CreateCommand': this.createBankAccount.bind(this),
        'DepositCommand': this.depositBankAccount.bind(this),
        'TransferCommand': this.transferBankAccount.bind(this),
    }

    // Dependency Injection is used
    constructor(public bankRepo: BankAccountRepository) {
        this.bankWriteSvc = bankRepo;
    }

    private createBankAccount(createCommand: CreateCommand): void {
        this.bankWriteSvc.createBankAccount(createCommand.payload.Name, createCommand.payload.Amount);
    }

    private depositBankAccount(depositCommand: DepositCommand): void {
        const { Account, Amount } = depositCommand.payload;
        if (Amount < 0) { throw new Error('Deposit amount must be greater than 0'); }
        this.bankWriteSvc.depositAccount(Account, Amount);
    }

    private transferBankAccount(transferCommand: TransferCommand): void {
        const { From, To, Amount } = transferCommand.payload;
        if (Amount < 0) { throw new Error('Withdraw amount must be greater than 0'); }

        this.bankWriteSvc.transferMoney(From, To, Amount);
    }

    public dispatchCommand(command: any): void {
        try {
            const handler = this.commandRouter[command.constructor.name];

            if (handler) {
                handler(command);
            } else {
                throw new Error(`No handler found for this command ${command.constructor.name}`);
            }

        } catch (e) {
            console.error(`Error occured for handler ${command.constructor.name}`, e);
        }
    }
}

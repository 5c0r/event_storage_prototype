import { IWriteBankAccount } from 'src/services';
import { BankAccountRepository } from 'src/services/bank-repository';
import { CreateCommand, DepositCommand, TransferCommand } from './interface/command.interface';

export class CommandHandler {
    readonly bankWriteSvc: IWriteBankAccount;

    readonly commandRouter = {
        'CreateCommand': this.createBankAccount,
        'DepositCommand': this.depositBankAccount,
        'TransferCommand': this.transferBankAccount,
    }
    constructor() {
        this.bankWriteSvc = new BankAccountRepository();
    }

    private createBankAccount(createCommand: CreateCommand): void {
        this.bankWriteSvc.createBankAccount(createCommand.payload.Name, createCommand.payload.Amount);
    }

    private depositBankAccount(depositCommand: DepositCommand): void {
        const { Account, Amount } = depositCommand.payload;
        this.bankWriteSvc.depositAccount(Account, Amount);
    }

    private transferBankAccount(transferCommand: TransferCommand): void {
        const { From, To, Amount } = transferCommand.payload;
        this.bankWriteSvc.transferMoney(From, To, Amount);
    }

    public dispatchCommand(commandName: string, payload: any): void {
        const handler = this.commandRouter[commandName];
        if (handler) {
            handler(payload);
        } else {
            console.error(`No handler found for this command ${commandName}`);
        }
    }
}

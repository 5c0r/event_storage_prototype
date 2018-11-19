import { ProjectionBase } from '../../../../src/infrastructure/interface/stream-state-base';
import { AccountWithdrawed, AccountDeposited } from '..';
import { AccountCreated } from '../bank-account-events';

export enum TransactionType {
    Withdraw = 1,
    Deposit = 2,
    Transfer = 3,
    Payment = 4,
    OnlineService = 5
}

export interface ITransactionInfo {
    Type: TransactionType;
    Amount: number;
    Description: string;
}

export interface IAmTransactionHistory {
    History: ITransactionInfo[];
    Name: string;
}

export class TransactionHistoryResponse implements IAmTransactionHistory {
    History: ITransactionInfo[];
    Name: string;

    static FromProjection(projection: TransactionHistory): TransactionHistoryResponse {
        return {
            History: projection.History,
            Name: projection.Name
        }
    }
}

export class TransactionHistory extends ProjectionBase implements IAmTransactionHistory {
    readonly History: ITransactionInfo[] = [];
    Name: string;

    constructor(streamId?: any) {
        super(streamId);
        this.WireUpEvents();
    }

    // I only cares about AccountCreated, AccountDeposited, AccountWithdrawed
    private WireUpEvents(): void {
        this.RegisterEvent(AccountCreated, this.accountCreated);
        this.RegisterEvent(AccountDeposited, this.accountDeposited);
        this.RegisterEvent(AccountWithdrawed, this.accountWithdrawed);
    }

    // Appliers
    private accountCreated = (ev: AccountCreated): void => {
        this.Name = ev.name;
        this.addToHistory({
            Type: TransactionType.Deposit, Amount: ev.startBalance,
            Description: 'First transaction'
        });
    }

    private accountDeposited = (ev: AccountDeposited): void => {
        const value = ev.Reason ? ev.Reason.indexOf('Transfer') > -1 ? -ev.Value : ev.Value : ev.Value;
        this.addToHistory({ Type: TransactionType.Deposit, Amount: value, Description: ev.Reason || '' });
    }

    private accountWithdrawed = (ev: AccountWithdrawed): void => {
        const value = ev.Reason ? ev.Reason.indexOf('Transfer') > -1 ? -ev.Value : ev.Value : ev.Value;
        this.addToHistory({ Type: TransactionType.Withdraw, Amount: value, Description: ev.Reason || '' });
    }
    // End of appliers

    private addToHistory(transaction: ITransactionInfo): void {
        this.History.push(transaction);
    }
}

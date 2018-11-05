import { ProjectionBase } from '../../../../src/infrastructure/interface/stream-state-base';
import { AccountCreated, AccountDeposited, AccountWithdrawed } from '../bank-account-events';

export class BankAccountBalance extends ProjectionBase {
    private balance: number = 0;

    constructor(streamId: any) {
        super(streamId);
        this.WireUpEvents();
    }

    // I only cares about AccountCreated, AccountDeposited, AccountWithdrawed
    public WireUpEvents(): void {
        this.RegisterEvent(AccountCreated, this.accountCreated);
        this.RegisterEvent(AccountDeposited, this.accountDeposited);
        this.RegisterEvent(AccountWithdrawed, this.accountWithdrawed);
    }


    public get Balance(): number {
        return this.balance;
    }

    // Appliers
    public accountCreated = (ev: AccountCreated): void => {
        this.balance = ev.startBalance;
    }

    public accountDeposited = (ev: AccountDeposited): void => {
        this.balance = this.balance + ev.Value;
    }

    public accountWithdrawed = (ev: AccountWithdrawed): void => {
        this.balance = this.balance - ev.Value;
    }
    // End of appliers
}

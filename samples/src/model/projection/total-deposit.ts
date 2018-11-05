import { ProjectionBase } from '../../../../src/infrastructure/interface/stream-state-base';
import { AccountCreated, AccountDeposited } from '../bank-account-events';

export class BankTotalDeposit extends ProjectionBase {
    private totalDeposit: number = 0;

    constructor(streamId: any) {
        super(streamId);
        this.WireUpEvents();
    }

    // I only cares about AccountCreated and AccountDeposited
    public WireUpEvents(): void {
        this.RegisterEvent(AccountCreated, this.accountCreated);
        this.RegisterEvent(AccountDeposited, this.accountDeposited);
    }

    public get TotalDeposit(): number {
        return this.totalDeposit;
    }

    // Appliers
    public accountCreated = (ev: AccountCreated): void => {
        this.totalDeposit = ev.startBalance;
    }

    public accountDeposited = (ev: AccountDeposited): void => {
        this.totalDeposit = this.totalDeposit + ev.Value;
    }
    // End of appliers
}

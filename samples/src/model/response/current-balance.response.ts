import { IHaveBalance, IHaveName, CurrentBalance } from '../projection/current-balance';

// Why this was introduced , because serialization is not so good in express
export class CurrentBalanceResponse implements IHaveBalance, IHaveName {

    static FromCurrentBalance(curBalance: CurrentBalance): CurrentBalanceResponse {
        return new CurrentBalanceResponse(curBalance.Name, curBalance.Balance);
    }

    constructor(public Name: string, public readonly Balance: number) { }

}
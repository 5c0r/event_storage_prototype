import { Service } from 'typedi';
import { JsonController, Get, Param, Res, ParamMetadata } from 'routing-controllers';
import { IReadBankAccount } from './../services';
import { BankAccountRepository } from './../services/bank-repository';
import { CurrentBalanceResponse } from './../model/response/current-balance.response';
import { TransactionHistoryResponse } from './../model/projection/transaction-history';

@Service()
@JsonController()
export class BankReadController {
    bankReader: IReadBankAccount;

    constructor(bankRdr: BankAccountRepository) {
        this.bankReader = bankRdr;
    }

    @Get('/account/:id')
    async get(@Param('id') accountId: string): Promise<any> {
        const res = await this.bankReader.getBankCurrentBalanceProjection(accountId);

        return CurrentBalanceResponse.FromCurrentBalance(res);
    }

    @Get('/account/:id/transaction')
    async getTransaction(@Param('id') id: string): Promise<any> {
        const res = await this.bankReader.getBankTransactionProjection(id);

        return TransactionHistoryResponse.FromProjection(res);
    }

}

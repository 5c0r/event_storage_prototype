import { JsonController, Get, Post, Param, Delete, Body, HttpCode } from 'routing-controllers';
import { Service } from 'typedi';
import { ReadCommandHandler } from './../bus/command-handler';
import {
    CreateCommand, CreatePayload,
    DepositCommand, DepositPayload, TransferPayload, TransferCommand
} from './../bus/interface/command.interface';

@Service()
@JsonController()
export class BankWriteController {
    constructor(private handler: ReadCommandHandler) {

    }

    @Post('/account')
    create(@Body() createPayload: CreatePayload): Promise<any> {
        console.log('postBody', createPayload);
        const command = new CreateCommand(createPayload.Name, createPayload.Amount);
        this.handler.dispatchCommand(command);

        return null;
    }

    @Post('/account/deposit')
    deposit(@Body() depositPayload: DepositPayload): Promise<any> {
        const command = new DepositCommand(depositPayload.Account, depositPayload.Amount);
        this.handler.dispatchCommand(command);

        return null;
    }

    @Post('/transfer')
    transfer(@Body() transferPayload: TransferPayload): Promise<any> {
        const command = new TransferCommand(transferPayload.From, transferPayload.To, transferPayload.Amount);
        this.handler.dispatchCommand(command);

        return null;
    }
}


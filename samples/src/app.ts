import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { BankWriteController } from './controllers/bank-write.controller';
import { BankReadController } from './controllers/bank-read.controller';


useContainer(Container);

const expressServer = createExpressServer({
    controllers: [
        BankWriteController,
        BankReadController
    ]
});

expressServer.listen(3000);

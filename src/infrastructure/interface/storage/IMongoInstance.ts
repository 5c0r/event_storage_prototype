import * as Mongoose from 'mongoose';
import { injectable } from 'inversify';

export interface IMongooseInstance {
    initialize(storageOpts: IStorageOption): void;
    dispose(): void;

    onInstanceError(err: Error): void;
    onInstanceStarted(): void;
    onInstanceClosed(): void;
}

export interface IStorageOption extends Mongoose.ConnectionOpenOptions, Mongoose.ConnectionOptions {

}

@injectable()
export class BaseMongooseInstance implements IMongooseInstance {

    private connection: Mongoose.Connection;
    private storageOptions: IStorageOption;

    private readonly fallbackStorageOpts: IStorageOption = {

    }

    constructor(private connString: string) {
    }

    initialize(storageOpts?: IStorageOption): void {
        this.storageOptions = storageOpts || this.fallbackStorageOpts;
        this.connection.open(this.connString, 'event_storage', 27017, this.storageOptions, this.onInstanceError);
    }


    // Logging 
    onInstanceError = (err: Error): void => console.error('BaseMongoose error', err);
    onInstanceStarted = (): void => console.info('Mongoose started');
    onInstanceClosed = (): void => console.log('Mongoose closed');

    dispose() {
        if (this.connection) this.connection.close(this.onInstanceClosed);
    }
}
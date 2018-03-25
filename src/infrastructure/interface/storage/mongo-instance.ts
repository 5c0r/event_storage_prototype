import * as Mongoose from 'mongoose';
// import { injectable } from 'inversify';

export interface MongooseInstance {
    connection: Mongoose.Connection;

    initialize(): void;
    dispose(): void;

    onInstanceError(err: Error): void;
    onInstanceStarted(): void;
    onInstanceClosed(): void;
}

export interface IStorageOption extends Mongoose.ConnectionOpenOptions, Mongoose.ConnectionOptions {

}

export class BaseMongooseInstance implements MongooseInstance {

    public connection: Mongoose.Connection;
    private storageOptions: IStorageOption;

    private readonly fallbackStorageOpts: IStorageOption = {

    }

    constructor(private connString: string) {
        Mongoose.connect(connString).then(this.onInstanceStarted, this.onInstanceError);
    }

    initialize(): void {
        // this.storageOptions = storageOpts || this.fallbackStorageOpts;
        // this.connection.open(this.connString, 'event_storage', 27017, this.storageOptions, this.onInstanceError);
    }


    // Logging 
    onInstanceError = (err: Error): void => console.error('BaseMongoose error', err);
    onInstanceStarted = (): void => {
        console.log('Mongoose started');
        this.connection = Mongoose.connection;
    }
    onInstanceClosed = (): void => console.log('Mongoose closed');

    dispose() {
        if (this.connection) {
            this.connection.close(this.onInstanceClosed);
        }
    }
}

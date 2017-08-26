import * as Mongoose from 'mongoose';

export interface IMongooseInstance {
    initialize(options: Mongoose.ConnectionOptions): void;
    dispose(): void;

    onInstanceError(err: Error): void;
    onInstanceStarted(): void;
    onInstanceClosed(): void;
}

export class BaseMongooseInstance implements IMongooseInstance {

    connection: Mongoose.Connection;

    constructor(connString: string) {

    }

    initialize(options: Mongoose.ConnectionOptions): void {
        throw new Error("Method not implemented.");
    }


    onInstanceError(err: Error): void {
        throw new Error("Method not implemented.");
    }
    onInstanceStarted(): void {
        throw new Error("Method not implemented.");
    }

    onInstanceClosed(): void {

    }

    dispose() {

    }
}
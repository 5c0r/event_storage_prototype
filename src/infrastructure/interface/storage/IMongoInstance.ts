import * as Mongoose from 'mongoose';

export interface IMongooseInstance {
    
    initialize( options : Mongoose.ConnectionOptions ) : void;

    onInstanceError( err : Error ) : void;
    onInstanceStarted() : void;
}
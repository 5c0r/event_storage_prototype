import * as Mongoose from "mongoose";


const ObjectId = Mongoose.Types.ObjectId;

interface IAggregateRoot extends Mongoose.Document {
    StreamId: AAGUID;
    Version: number;
    LastModified: Date;
}

const AggregateRootSchema = new Mongoose.Schema({
    StreamId: { type: ObjectId, required: true, index: true },
    Version: Number,
    LastModified: Date
})

const Aggregate = Mongoose.model<IAggregateRoot>("aggregate_root", AggregateRootSchema);

export { IAggregateRoot, AggregateRootSchema, Aggregate }

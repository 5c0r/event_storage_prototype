import * as Mongoose from "mongoose";
import { IAggregateRootDbSchema } from "./../interface/IAggregate";

const ObjectId = Mongoose.Schema.Types.ObjectId;

const AggregateRootSchema = new Mongoose.Schema({
    _id: { type: ObjectId, required: true, index: true },
    Version: Number,
    LastModified: Date
})

const Aggregate = Mongoose.model<IAggregateRootDbSchema>("aggregate_root", AggregateRootSchema);

export { AggregateRootSchema, Aggregate }

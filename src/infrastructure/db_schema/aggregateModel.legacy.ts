import * as Mongoose from 'mongoose';
import { AggregateRootDbSchema } from './../interface/aggregate';

const ObjectId = Mongoose.Schema.Types.ObjectId;

const AggregateRootSchema = new Mongoose.Schema({
    _id: { type: ObjectId, required: true, index: true },
    Version: Number,
    LastModified: Date
})

const AggregateModel = Mongoose.model<AggregateRootDbSchema>('aggregate_root', AggregateRootSchema);

export { AggregateRootSchema, AggregateModel }

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var Mongoose = require("mongoose");
var inversify_1 = require("inversify");
var Aggregate_1 = require("./../src/infrastructure/db_schema/Aggregate");
var StorageEngine = (function () {
    function StorageEngine(connString) {
        this.onConnectionError = function (err) { return console.log('MongoDb connection err ', err); };
        this.onConnectionOpened = function () {
            console.log('MongoDb Connected ');
        };
        Mongoose.connect(connString);
        this.connectionInstance = Mongoose.connection;
        this.connectionInstance.on('error', this.onConnectionError);
        this.connectionInstance.on('open', this.onConnectionOpened);
        console.log('MongoDB intance', this.connectionInstance);
    }
    StorageEngine.prototype.startStream = function () {
        var newStream = new Aggregate_1.Aggregate({
            _id: new Mongoose.Types.ObjectId(),
            Version: 0,
            LastModified: new Date()
        });
        newStream.save();
        console.log('newStream', newStream);
    };
    StorageEngine = __decorate([
        inversify_1.injectable()
    ], StorageEngine);
    return StorageEngine;
}());
exports.StorageEngine = StorageEngine;
var connString = 'mongodb://localhost/event_storage';
var engine = new StorageEngine(connString);

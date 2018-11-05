import { MessageQueue } from './message-queue';
// import { } from 'jest';
import { Message } from '../message/message.interface';
import { IHandle, IHandleFn } from '../command/handle.interface';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { setTimeout } from 'timers';




describe('Message Queue', () => {

    class TestMessage implements Message {

    }

    class TestHandler implements IHandle<TestMessage> {
        name = 'TestHandler';

        handle: IHandleFn<TestMessage> = (msg: TestMessage): Observable<any> => {
            console.log('hello', msg, typeof msg);
            return of();
        }
    }

    class AnotherTestHandler implements IHandle<TestMessage> {
        name = 'AnotherTestHandler';

        handle: IHandleFn<TestMessage> = (msg: TestMessage): Observable<any> => {
            console.log('hello', msg, typeof msg);

            return of();
        }
    }


    let queueUnderTest = new MessageQueue();

    beforeEach(async () => {
        queueUnderTest = new MessageQueue();
    })

    test('smoke test', () => {
        expect(MessageQueue).toBeTruthy();
    })

    test('should be able to register', () => {
        const handler = new TestHandler();
        const another = new AnotherTestHandler();

        queueUnderTest.Register(handler);
        queueUnderTest.Register(another);

        expect(Object.keys(queueUnderTest.Router).length).toBe(2);
    })

    // TODO: This test does not work yet
    test('should be able to dispatch a message to the queue', async () => {
        const handler = new TestHandler();
        const another = new AnotherTestHandler();

        const message = new TestMessage();

        queueUnderTest.Register(handler);
        queueUnderTest.Register(another);

        queueUnderTest.GetInstance.toPromise().then((value: Message) => {
            expect(value).toBe(null);
            expect(true).toBe(false);
        })

        expect(Object.keys(queueUnderTest.Router).length).toBe(2);

        queueUnderTest.Send(message);
    });
})
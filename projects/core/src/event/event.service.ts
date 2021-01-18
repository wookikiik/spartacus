import { Injectable, isDevMode, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CxEvent } from './cx-event';
import { MergingSubject } from './utils/merging-subject';

/**
 * The object holds registered source observables as well as the merged result observable.
 */
interface EventMeta<T> {
  /**
   * Input subject used for dispatching occasional event (without registering a source)
   */
  inputSubject$: Subject<T>;

  /**
   * A custom subject that allows for dynamic adding and removing sources to be merged as an output
   */
  mergingSubject: MergingSubject<T>;
}

/**
 * A service to register and observe event sources. Events are driven by event types, which are class signatures
 * for the given event.
 *
 * It is possible to register multiple sources to a single event, even without
 * knowing as multiple decoupled features can attach sources to the same
 * event type.
 */
@Injectable({
  providedIn: 'root',
})
export class EventService {
  /**
   * The various events meta are collected in a map, stored by the event type class
   */
  private eventsMeta = new Map<Type<any>, EventMeta<any>>();

  /**
   * Register an event source for the given event type.
   *
   * CAUTION: To avoid memory leaks, the returned teardown function should be called
   *  when the event source is no longer maintained by its creator
   * (i.e. in `ngOnDestroy` if the event source was registered in the component).
   *
   * @param eventType the event type
   * @param source$ an observable that represents the source
   *
   * @returns a teardown function which unregisters the given event source
   */
  register<T>(eventType: Type<T>, source$: Observable<T>): () => void {
    let mergingSubjects: MergingSubject<T>[] = [];
    let parentType = eventType;
    while (!!parentType) {
      console.log('registering for xxx: ', parentType);
      const eventMeta = this.getEventMeta(parentType);

      if (eventMeta.mergingSubject.has(source$)) {
        if (isDevMode()) {
          console.warn(
            `EventService: the event source`,
            source$,
            `has been already registered for the type`,
            parentType
          );
        }
      } else {
        eventMeta.mergingSubject.add(source$);
      }
      mergingSubjects.push(eventMeta.mergingSubject);

      if (
        !parentType.prototype ||
        parentType.prototype.__proto__.constructor.name === 'Object'
      ) {
        break;
      }
      parentType = parentType.prototype.__proto__.constructor;
    }

    return () =>
      mergingSubjects.forEach((mergingSubject) =>
        mergingSubject.remove(source$)
      );
  }

  /**
   * Returns a stream of events for the given event type
   * @param eventTypes event type
   */
  get<T>(eventType: Type<T>): Observable<T> {
    let output$ = this.getEventMeta(eventType).mergingSubject.output$;
    if (isDevMode()) {
      output$ = this.getValidatedEventStream(output$, eventType);
    }
    return output$;
  }

  /**
   * Dispatches an instance of an individual event.
   */
  dispatch(event: Object): void {
    const eventType = event.constructor as Type<any>;

    let eventClass = eventType;
    while (!!eventClass) {
      console.log('dispatching for xxx: ', eventClass);
      const inputSubject$ = this.getInputSubject(eventClass);
      inputSubject$.next(event);

      if (
        !eventClass.prototype ||
        eventClass.prototype.__proto__.constructor.name === 'Object'
      ) {
        break;
      }
      eventClass = eventClass.prototype.__proto__.constructor;
    }
  }

  /**
   * Returns the input subject used to dispatch a single event.
   * The subject is created on demand, when it's needed for the first time.
   * @param eventType type of event
   */
  private getInputSubject<T>(eventType: Type<T>): Subject<T> {
    const eventMeta = this.getEventMeta(eventType);

    if (!eventMeta.inputSubject$) {
      eventMeta.inputSubject$ = new Subject<any>();
      this.register(eventType, eventMeta.inputSubject$);
    }
    return eventMeta.inputSubject$;
  }

  /**
   * Returns the event meta object for the given event type
   */
  private getEventMeta<T>(eventType: Type<T>): EventMeta<T> {
    if (isDevMode()) {
      this.validateEventType(eventType);
    }

    if (!this.eventsMeta.get(eventType)) {
      this.createEventMeta(eventType);
    }
    return this.eventsMeta.get(eventType);
  }

  /**
   * Creates the event meta object for the given event type
   */
  private createEventMeta<T>(eventType: Type<T>): void {
    // console.log('-----------------------------------');
    // console.log('eventType: ', eventType);
    // console.log('(eventType as any).type: ', (eventType as any).type); // prints type property, if exists ✅
    // console.log(
    //   'Object.getPrototypeOf(eventType): ',
    //   Object.getPrototypeOf(eventType)
    // ); // gives class ✅
    // console.log(
    //   'Object.getPrototypeOf(eventType.prototype): ',
    //   Object.getPrototypeOf(eventType.prototype)
    // ); // gives class ✅
    // console.log(
    //   'Object.getPrototypeOf(eventType).type: ',
    //   Object.getPrototypeOf(eventType).type
    // ); // gives class super type ✅

    // console.log('eventType.prototype: ', eventType.prototype);
    // console.log(
    //   'eventType.prototype.__proto__: ',
    //   eventType.prototype.__proto__
    // );
    // console.log(
    //   'eventType.prototype.__proto__.constructor: ',
    //   eventType.prototype.__proto__.constructor
    // );
    // console.log(
    //   'eventType.prototype.__proto__.constructor.name: ',
    //   eventType.prototype.__proto__.constructor.name
    // );

    let parentType = eventType;
    while (!!parentType) {
      console.log('xxx registering: ', parentType);
      this.eventsMeta.set(parentType, {
        inputSubject$: null, // will be created lazily by the `dispatch` method
        mergingSubject: new MergingSubject(),
      });

      if (
        !parentType.prototype ||
        parentType.prototype.__proto__.constructor.name === 'Object'
      ) {
        break;
      }

      parentType = parentType.prototype.__proto__.constructor;
      if (this.eventsMeta.has(parentType)) {
        break;
      }
    }
  }

  /**
   * Checks if the event type is a valid type (is a class with constructor).
   *
   * Should be used only in dev mode.
   */
  private validateEventType<T>(eventType: Type<T>): void {
    if (!eventType?.constructor) {
      throw new Error(
        `EventService: ${eventType} is not a valid event type. Please provide a class reference.`
      );
    }

    let parentType = eventType;
    let extendsCxClass = false;
    while (!!parentType) {
      if (!Object.getOwnPropertyNames(parentType).includes('type')) {
        console.warn(
          `EventService: ${parentType} does not contain the static 'type' property. Please add e.g.: static type = '${parentType.name}'`
        );
      } else if (!extendsCxClass && parentType['type'] === CxEvent.type) {
        extendsCxClass = true;
      }

      if (
        !parentType.prototype ||
        parentType.prototype.__proto__.constructor.name === 'Object'
      ) {
        break;
      }
      parentType = parentType.prototype.__proto__.constructor;
    }

    if (!extendsCxClass) {
      console.warn(
        `The ${eventType} (or its ancestors) does not inherit from the 'CxEvent'. Please inherit it.`
      );
    }
  }

  /**
   * Returns the given event source with runtime validation whether the emitted values are instances of given event type.
   *
   * Should be used only in dev mode.
   */
  private getValidatedEventStream<T>(
    source$: Observable<T>,
    eventType: Type<T>
  ): Observable<T> {
    return source$.pipe(
      tap((event) => {
        if (!(event instanceof eventType)) {
          console.warn(
            `EventService: The stream`,
            source$,
            `emitted the event`,
            event,
            `that is not an instance of the declared type`,
            eventType.name
          );
        }
      })
    );
  }
}

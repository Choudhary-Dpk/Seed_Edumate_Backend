import { EventEmitter } from "events";

export const jobEvents = new EventEmitter();
jobEvents.setMaxListeners(100);

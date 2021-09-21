/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Task;
const _ = require('underscore-plus');
const ChildProcess = require('child_process');
const {Emitter} = require('event-kit');
const Grim = require('grim');

// Extended: Run a node script in a separate process.
//
// Used by the fuzzy-finder and [find in project](https://github.com/atom/atom/blob/master/src/scan-handler.coffee).
//
// For a real-world example, see the [scan-handler](https://github.com/atom/atom/blob/master/src/scan-handler.coffee)
// and the [instantiation of the task](https://github.com/atom/atom/blob/4a20f13162f65afc816b512ad7201e528c3443d7/src/project.coffee#L245).
//
// ## Examples
//
// In your package code:
//
// ```coffee
// {Task} = require 'atom'
//
// task = Task.once '/path/to/task-file.coffee', parameter1, parameter2, ->
//   console.log 'task has finished'
//
// task.on 'some-event-from-the-task', (data) =>
//   console.log data.someString # prints 'yep this is it'
// ```
//
// In `'/path/to/task-file.coffee'`:
//
// ```coffee
// module.exports = (parameter1, parameter2) ->
//   # Indicates that this task will be async.
//   # Call the `callback` to finish the task
//   callback = @async()
//
//   emit('some-event-from-the-task', {someString: 'yep this is it'})
//
//   callback()
// ```
module.exports =
(Task = (function() {
  Task = class Task {
    static initClass() {
  
      // Called upon task completion.
      //
      // It receives the same arguments that were passed to the task.
      //
      // If subclassed, this is intended to be overridden. However if {::start}
      // receives a completion callback, this is overridden.
      this.prototype.callback = null;
    }
    // Public: A helper method to easily launch and run a task once.
    //
    // * `taskPath` The {String} path to the CoffeeScript/JavaScript file which
    //   exports a single {Function} to execute.
    // * `args` The arguments to pass to the exported function.
    //
    // Returns the created {Task}.
    static once(taskPath, ...args) {
      const task = new Task(taskPath);
      task.once('task:completed', () => task.terminate());
      task.start(...Array.from(args || []));
      return task;
    }

    // Public: Creates a task. You should probably use {.once}
    //
    // * `taskPath` The {String} path to the CoffeeScript/JavaScript file that
    //   exports a single {Function} to execute.
    constructor(taskPath) {
      this.emitter = new Emitter;

      const compileCachePath = require('./compile-cache').getCacheDirectory();
      taskPath = require.resolve(taskPath);

      const env = Object.assign({}, process.env, {userAgent: navigator.userAgent});
      this.childProcess = ChildProcess.fork(require.resolve('./task-bootstrap'), [compileCachePath, taskPath], {env, silent: true});

      this.on("task:log", function() { return console.log(...arguments); });
      this.on("task:warn", function() { return console.warn(...arguments); });
      this.on("task:error", function() { return console.error(...arguments); });
      this.on("task:deprecations", function(deprecations) {
        for (let deprecation of Array.from(deprecations)) { Grim.addSerializedDeprecation(deprecation); }
      });
      this.on("task:completed", (...args) => (typeof this.callback === 'function' ? this.callback(...Array.from(args || [])) : undefined));

      this.handleEvents();
    }

    // Routes messages from the child to the appropriate event.
    handleEvents() {
      this.childProcess.removeAllListeners();
      this.childProcess.on('message', ({event, args}) => {
        if (this.childProcess != null) { return this.emitter.emit(event, args); }
      });

      // Catch the errors that happened before task-bootstrap.
      if (this.childProcess.stdout != null) {
        this.childProcess.stdout.removeAllListeners();
        this.childProcess.stdout.on('data', data => console.log(data.toString()));
      }

      if (this.childProcess.stderr != null) {
        this.childProcess.stderr.removeAllListeners();
        return this.childProcess.stderr.on('data', data => console.error(data.toString()));
      }
    }

    // Public: Starts the task.
    //
    // Throws an error if this task has already been terminated or if sending a
    // message to the child process fails.
    //
    // * `args` The arguments to pass to the function exported by this task's script.
    // * `callback` (optional) A {Function} to call when the task completes.
    start(...args1) {
      const adjustedLength = Math.max(args1.length, 1), args = args1.slice(0, adjustedLength - 1), callback = args1[adjustedLength - 1];
      if (this.childProcess == null) { throw new Error('Cannot start terminated process'); }

      this.handleEvents();
      if (_.isFunction(callback)) {
        this.callback = callback;
      } else {
        args.push(callback);
      }
      this.send({event: 'start', args});
      return undefined;
    }

    // Public: Send message to the task.
    //
    // Throws an error if this task has already been terminated or if sending a
    // message to the child process fails.
    //
    // * `message` The message to send to the task.
    send(message) {
      if (this.childProcess != null) {
        this.childProcess.send(message);
      } else {
        throw new Error('Cannot send message to terminated process');
      }
      return undefined;
    }

    // Public: Call a function when an event is emitted by the child process
    //
    // * `eventName` The {String} name of the event to handle.
    // * `callback` The {Function} to call when the event is emitted.
    //
    // Returns a {Disposable} that can be used to stop listening for the event.
    on(eventName, callback) { return this.emitter.on(eventName, args => callback(...Array.from(args || []))); }

    once(eventName, callback) {
      let disposable;
      return disposable = this.on(eventName, function(...args) {
        disposable.dispose();
        return callback(...Array.from(args || []));
      });
    }

    // Public: Forcefully stop the running task.
    //
    // No more events are emitted once this method is called.
    terminate() {
      if (this.childProcess == null) { return false; }

      this.childProcess.removeAllListeners();
      if (this.childProcess.stdout != null) {
        this.childProcess.stdout.removeAllListeners();
      }
      if (this.childProcess.stderr != null) {
        this.childProcess.stderr.removeAllListeners();
      }
      this.childProcess.kill();
      this.childProcess = null;

      return true;
    }

    // Public: Cancel the running task and emit an event if it was canceled.
    //
    // Returns a {Boolean} indicating whether the task was terminated.
    cancel() {
      const didForcefullyTerminate = this.terminate();
      if (didForcefullyTerminate) {
        this.emitter.emit('task:cancelled');
      }
      return didForcefullyTerminate;
    }
  };
  Task.initClass();
  return Task;
})());

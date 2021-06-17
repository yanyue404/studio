class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  depend() {
    if (activeUpdate) {
      // register the current active update as a subscriber
      this.subscribers.add(activeUpdate);
    }
  }

  notify() {
    // run all subscriber functions
    this.subscribers.forEach(subscriber => subscriber());
  }
}

let activeUpdate;

function autorun(update) {
  function wrappedUpdate() {
    activeUpdate = wrappedUpdate;
    update();
    activeUpdate = null;
  }
  wrappedUpdate();
}

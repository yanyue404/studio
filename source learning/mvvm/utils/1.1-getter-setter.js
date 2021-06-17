function isObject(obj) {
  return (
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    obj !== null &&
    obj !== undefined
  );
}

function convert(obj) {
  if (!isObject(obj)) {
    throw new TypeError();
  }

  Object.keys(obj).forEach(key => {
    let internalValue = obj[key];
    Object.defineProperty(obj, key, {
      get() {
        console.log(`getting key "${key}": ${internalValue}`);
        return internalValue;
      },
      set(newValue) {
        console.log(`setting key "${key}" to: ${newValue}`);
        internalValue = newValue;
      },
    });
  });
}

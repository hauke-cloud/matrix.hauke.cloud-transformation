if (data.counter === undefined) {
  // The API didn't give us a counter, send no message.
  result = { empty: true, version: "v2" };
} else if (data.counter > data.maxValue) {
  result = {
    plain: `**Oh no!** The counter has gone over by ${data.counter - data.maxValue}`,
    version: "v2",
  };
} else {
  result = {
    plain: `*Everything is fine*, the counter is under by ${data.maxValue - data.counter}`,
    version: "v2",
  };
}

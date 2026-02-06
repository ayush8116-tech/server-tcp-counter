const getCounterHtmlTemplate = (value) => {
  return `<html>
  <body>
    <h1>Counter : ${value}</h1>
    <h3><a href="/counter/inc">INC</a>    <a href="/counter/dec">DEC</a></h3>
    <h3><a href="/">RESET</a></h3>
  </body>
</html>`;
};

const readFromJson = (path) => Deno.readTextFileSync(path);

const getValues = () => {
  const data = readFromJson("./counter.json");
  return JSON.parse(data);
};

const getCounterDetails = (value, index) => {
  const counterDetails = {
    previous: value,
    current: index === 0 ? value : value + 1,
    next: null,
    index: index + 1,
  };
  console.log(counterDetails.current);

  return counterDetails;
};

const writeToJson = (counterDetails) => {
  const values = getValues();
  if (counterDetails.index > 1) {
    values[values.length - 1].next = counterDetails.current;
  }
  values.push(counterDetails);
  console.log(values);
  Deno.writeTextFileSync("./counter.json", JSON.stringify(values));
};

const getCounterValueAndIndex = () => {
  const values = getValues();
  const counter = values[values.length - 1];
  console.log({ currentCounter: counter });

  return { value: counter.current, index: counter.index };
};

const createResponse = (content, status) => {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html",
    },
  });
};

const decrementHandler = () => {
  const values = getValues()
  const counterDetails = values[values.length - 1]
  writeToJson(counterDetails);
  const body = getCounterHtmlTemplate(counterDetails.previous);

  return createResponse(body, 201);
};

const incrementHandler = () => {
  const { value, index } = getCounterValueAndIndex();
  const counterDetails = getCounterDetails(value, index);
  writeToJson(counterDetails);
  const body = getCounterHtmlTemplate(counterDetails.current);
  return createResponse(body, 201);
};

const resetHandler = () => {
  const counterDetails = getCounterDetails(0, 0, 0);
  writeToJson(counterDetails);
  const body = getCounterHtmlTemplate(0);
  return createResponse(body, 200);
};

export const handleRequest = (request) => {
  const { pathname } = new URL(request.url);
  console.log(pathname);

  const handlerMapper = {
    "/": () => resetHandler(),
    "/counter/inc": () => incrementHandler(),
    "/counter/dec": () => decrementHandler(),
  };

  const handler = handlerMapper[pathname];
  const response = handler();

  return response;
};

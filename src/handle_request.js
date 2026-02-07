import { generateDelivery } from "./score_lib.js";
import { getHtmlTemplate } from "./html_template.js";

const readFromJson = (path) => Deno.readTextFileSync(path);
const writeToJson = (path, content) => Deno.writeTextFileSync(path, content);

const getDeliveries = () => {
  const data = readFromJson("./data/score_data.json");
  return JSON.parse(data);
};

const write = (delivery) => {
  const deliveries = getDeliveries();
  deliveries.push(delivery);

  writeToJson("./data/score_data.json", JSON.stringify(deliveries));
};

const createResponse = (content, status) => {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html",
    },
  });
};

const undoHandler = () => {
  const deliveries = getDeliveries();
  if (deliveries.length > 1) {
    deliveries.pop();
  }

  const currentDelivery = deliveries[deliveries.length - 1];
  writeToJson("./data/score_data.json", JSON.stringify(deliveries));
  const body = getHtmlTemplate(currentDelivery);

  return createResponse(body, 201);
};

const incrementHandler = (delta) => {
  const deliveries = getDeliveries();
  const delivery = deliveries[deliveries.length - 1];
  console.log({ deliveries });

  delivery.score = delta;
  const newDelivery = generateDelivery(delivery);
  write(newDelivery);
  const body = getHtmlTemplate(newDelivery);
  return createResponse(body, 201);
};

const resetHandler = () => {
  const delivery = { over: 0, score: 0, total: 0 };
  const deliveries = [delivery];
  writeToJson("./data/score_data.json", JSON.stringify(deliveries));
  const body = getHtmlTemplate(delivery);
  return createResponse(body, 200);
};

export const handleRequest = (request) => {
  const { pathname } = new URL(request.url);
  console.log(pathname);

  const handlerMapper = {
    "/": () => resetHandler(),
    "/counter/zero": () => incrementHandler(0),
    "/counter/one": () => incrementHandler(1),
    "/counter/two": () => incrementHandler(2),
    "/counter/three": () => incrementHandler(3),
    "/counter/four": () => incrementHandler(4),
    "/counter/five": () => incrementHandler(5),
    "/counter/six": () => incrementHandler(6),
    "/counter/undo": () => undoHandler(),
  };

  const handler = handlerMapper[pathname];
  const response = handler();

  return response;
};

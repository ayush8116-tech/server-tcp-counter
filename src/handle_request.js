import { processDeliveries, startMatch } from "./score_manager.js";

const createResponse = (content, status) => {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html",
    },
  });
};

const scorerPage = Deno.readTextFileSync("./pages/score_page.html");

const createResponseBody = (match) => {
  const updatedPageWithTotal = scorerPage.replace("${total}", match.total);
  const updatedPageWithOver = updatedPageWithTotal.replace(
    "${over}",
    match.over,
  );
  const updatedPageWithInning = updatedPageWithOver.replace(
    "${inning}",
    match.inning,
  );
  const updatedPageWithTarget = updatedPageWithInning.replace("${target}", match.target)

  return updatedPageWithTarget;
};

const scoreHandler = (runs) => {
  const matchDetail = processDeliveries(runs);

  const body = createResponseBody(matchDetail);
  return createResponse(body, 201);
};

const resetHandler = () => {
  const summary = startMatch();

  const body = createResponseBody(summary);
  return createResponse(body, 200);
};

export const handleRequest = (request) => {
  const { pathname } = new URL(request.url);

  const handlerMapper = {
    "/": () => resetHandler(),
    "/counter/zero": () => scoreHandler(0),
    "/counter/one": () => scoreHandler(1),
    "/counter/two": () => scoreHandler(2),
    "/counter/three": () => scoreHandler(3),
    "/counter/four": () => scoreHandler(4),
    "/counter/five": () => scoreHandler(5),
    "/counter/six": () => scoreHandler(6),
  };

  const handler = handlerMapper[pathname];
  const response = handler();

  return response;
};

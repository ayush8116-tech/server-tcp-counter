import { processEvent, startMatch } from "./score_manager.js";

const createResponse = (content, status) => {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html",
    },
  });
};

const SCORER_PAGE_TEMPLATE = Deno.readTextFileSync("./pages/score_page.html");
const WINNING_PAGE_TEMPLATE = Deno.readTextFileSync(
  "./pages/winning_page.html",
);

const createResponseBody = (match) => {
  if (match.winningTeam) {
    return WINNING_PAGE_TEMPLATE.replace("${winningTeam}", match.winningTeam);
  }

  const dataToUpdate = {
    "${total}": match.total,
    "${wicket}": match.wicket,
    "${over}": match.over,
    "${inning}": match.inning,
    "${target}": match.target,
  };
  
  let updatedPage = SCORER_PAGE_TEMPLATE;

  for (const data in dataToUpdate) {
    updatedPage = updatedPage.replace(data, dataToUpdate[data]);
  }

  return updatedPage;
};

const scoreHandler = (event, isExtra) => {
  const matchDetail = processEvent(event, isExtra);

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
    "/counter/wide": () => scoreHandler(1, true),
    "/counter/noBall": () => scoreHandler(1, true),
    "/counter/wicket": () => scoreHandler("wicket", false),
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

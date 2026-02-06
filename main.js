import { handleRequest } from "./handle_request.js";

const main = () => {
  Deno.serve({ port: 8000 }, handleRequest);
};

main();

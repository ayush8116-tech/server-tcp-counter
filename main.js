import { handleRequest } from "./src/handle_request.js";

const main = () => {
  Deno.serve({ port: 8080 }, handleRequest);
};

main();

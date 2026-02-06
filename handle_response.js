const getResponse = async (ctrValue) => {
  const res = await fetch("http://localhost:8000/counter/inc", {
    method: "POST",
    header: { "content-type": "text/html" },
    body: ctrValue,
  });

  console.log({ res });
  return res;
};

const response = await getResponse()
const body = await response.text();

Deno.writeTextFileSync("./counter.html", body);

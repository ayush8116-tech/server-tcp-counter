const updateOverCount = (overCount, ballCount) => {
  if (ballCount === undefined) {
    return { overCount, ballCount: 1 };
  }

  if (ballCount >= 5) {
    return { overCount: +overCount + 1, ballCount: 0 };
  }

  return { overCount: +overCount, ballCount: +ballCount + 1 };
};

const summariseOverDetails = (overDetails) => {
  return +`${overDetails.overCount}.${overDetails.ballCount}`;
};

const updateBalls = (over) => {
  const [overCount, ballCount] = String(over).split(".");
  const overDetails = updateOverCount(overCount, ballCount);
  return summariseOverDetails(overDetails);
};

const startOver = (overCount, innings) => {
  const inningCount = innings.summary.inning;
  console.log({ inningCount });

  innings[inningCount - 1].push({ over: overCount, deliveries: [] });
};

const startInning = (innings, inningNumber) => {
  const matchData = { ...innings };
  const inning = [];
  matchData[inningNumber] = inning;
  return matchData;
};

const endInning = (matchData) => {
  const updatedMatchData = startInning(matchData, 1);
  updatedMatchData.summary["target"] = matchData.summary["total"];
  updatedMatchData.summary["total"] = 0;
  updatedMatchData.summary["over"] = 0;
  updatedMatchData.summary["inning"] = matchData.summary.inning + 1;
  startOver(matchData.summary.over, updatedMatchData);
  return updatedMatchData;
};

const writeToJson = (path, content) =>
  Deno.writeTextFileSync(path, JSON.stringify(content));

const readFromJson = (path) => {
  const data = Deno.readTextFileSync(path);
  return JSON.parse(data);
};

export const startMatch = () => {
  const summary = { over: 0, total: 0, inning: 1, target: 0 };
  const innings = startInning({}, 0);
  innings.summary = summary;
  startOver(0, innings);
  writeToJson("./data/match.json", innings);
  return innings.summary;
};

const hasOverFinished = (over) => over > 0 && over === Math.floor(over);
const hasInningFinished = (over) => over === 2;

const addData = (delivery, matchData) => {
  const { inning, over } = matchData.summary;

  matchData[inning - 1][Math.floor(over)].deliveries.push(delivery);
  matchData.summary.total += delivery.run;
  const overCount = updateBalls(over);
  matchData.summary["over"] = overCount;

  matchData.summary["inning"] = inning;
  return matchData;
};

const addDelivery = (run, innings) => {
  let matchData = { ...innings };

  const { over } = matchData.summary;
  const delivery = { run };
  if (hasOverFinished(over)) {
    startOver(over, matchData);
  }

  if (hasInningFinished(over)) {
    matchData = endInning(matchData);
  }

  const updatedData = addData(delivery, matchData);
  return updatedData;
};

export const processDeliveries = (run) => {
  const matchData = readFromJson("./data/match.json");
  const updatedData = addDelivery(run, matchData);
  writeToJson("./data/match.json", updatedData);
  return updatedData.summary;
};

startMatch();

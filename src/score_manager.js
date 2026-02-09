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

  innings[inningCount].push({ over: overCount, deliveries: [] });
};

const startInning = (innings, inningNumber) => {
  const matchData = { ...innings };
  const inning = [];
  matchData[inningNumber] = inning;

  return matchData;
};

const endInning = (matchData) => {
  const updatedMatchData = startInning(matchData, 2);
  updatedMatchData.summary["target"] = matchData.summary["total"] + 1;
  updatedMatchData.summary["team1Score"] = matchData.summary["total"];
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
  const summary = {
    over: 0,
    total: 0,
    inning: 1,
    extras : 0,
    target: 0,
    team1Score: 0,
    team2Score: 0,
  };
  const innings = startInning({}, 1);
  innings.summary = summary;
  startOver(0, innings);
  writeToJson("./data/match.json", innings);

  return innings.summary;
};

const endMatch = (match) => {
  const { summary } = match;
  summary.winningTeam = summary.total >= summary.target ? "teamB" : "team1";
  summary.team2Score = summary.total;
  const data = readFromJson("./data/cricsheet.json");
  data.push(match);
  writeToJson("./data/cricsheet.json", data);

  return match;
};

const hasOverFinished = (over) => over > 0 && over === Math.floor(over);
const hasInningFinished = ({ over, inning }) => over === 2 && inning === 1;
const hasMatchFinished = (match) =>
  match.inning === 2 &&
  match.total >= match.target;

const addData = (delivery, matchData, isExtra) => {
  const { inning, over } = matchData.summary;

  matchData[inning][Math.floor(over)].deliveries.push(delivery);
  matchData.summary.total += isExtra ? delivery.extraRun : delivery.batterRun;
  const overCount = isExtra ? over : updateBalls(over);
  matchData.summary["over"] = overCount;
  matchData.summary["inning"] = inning;

  return matchData;
};

const addDelivery = (run, innings, isExtra) => {
  let matchData = { ...innings };

  const { over } = matchData.summary;
  let delivery = { batterRun: run, extraRun: 0 };
  if (isExtra) {
    delivery = { batterRun: 0, extraRun: run };
    matchData.summary.extras += run;
  }

  if (hasMatchFinished(matchData.summary)) {
    const updatedMatchData = endMatch(matchData);
    return updatedMatchData;
  }

  if (hasInningFinished(matchData.summary)) {
    matchData = endInning(matchData);
  }

  if (hasOverFinished(over)) {
    startOver(over, matchData);
  }

  const updatedData = addData(delivery, matchData, isExtra);

  return updatedData;
};

export const processDeliveries = (run, isExtra) => {
  const matchData = readFromJson("./data/match.json");
  const updatedData = addDelivery(run, matchData, isExtra);
  writeToJson("./data/match.json", updatedData);

  return updatedData.summary;
};

startMatch();

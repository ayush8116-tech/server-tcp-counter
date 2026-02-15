const writeToJson = (path, content) =>
  Deno.writeTextFileSync(path, JSON.stringify(content));

const readFromJson = (path) => {
  const data = Deno.readTextFileSync(path);
  return JSON.parse(data);
};

const updateOverCount = (overCount, ballCount) => { // update over by doing mod %
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

const startNewOver = (overCount, match) => {
  const inningCount = match.summary.inning - 1;

  match.innings[inningCount].push({ over: overCount, deliveries: [] });
};

const startInning = (match, inningNumber) => {
  const matchData = { ...match };
  const inning = [];

  if (inningNumber === 1) {
    matchData.innings = [];
    matchData.innings.push(inning);
    console.log({ matchData });
    return matchData;
  }

  console.log({ matchData });
  matchData.innings.push(inning);
  return matchData;
};

const updateSummary = ({ summary }, matchData) => {
  summary["target"] = matchData.summary["total"] + 1;
  summary["team1Score"] = matchData.summary["total"];
  summary["total"] = 0;
  summary["over"] = 0;
  summary["wicket"] = 0;
  summary["inning"] = matchData.summary.inning + 1;
};

const endInning = (matchData) => {
  const updatedMatchData = startInning(matchData, 2);

  updateSummary(matchData, updatedMatchData);
  startNewOver(matchData.summary.over, updatedMatchData);

  return updatedMatchData;
};

export const startMatch = () => {
  const summary = {
    over: 0,
    total: 0,
    wicket: 0,
    striker: "",
    nonStriker: "",
    bowler: "",
    inning: 1,
    extras: 0,
    target: 0,
    team1Score: 0,
    team2Score: 0,
  };

  const innings = startInning({}, 1);

  innings.summary = summary;
  startNewOver(0, innings);
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

const hasInningFinished = ({ over, inning, wicket }) =>
  (over === 2 && inning === 1) || wicket >= 10;

const hasMatchFinished = (match) =>
  match.inning === 2 &&
  match.total >= match.target;

const addDelivery = (delivery, matchData, isExtra) => {
  const { inning, over } = matchData.summary;

  matchData.innings[inning - 1][Math.floor(over)].deliveries.push(delivery);
  matchData.summary.total += isExtra ? delivery.extraRun : delivery.batterRun;
  matchData.summary.wicket += delivery.isWicket ? 1 : 0;

  const overCount = isExtra ? over : updateBalls(over);

  matchData.summary.over = overCount;
  matchData.summary.inning = inning;

  return matchData;
};

const createDelivery = (event, isExtra, summary) => {
  let delivery = { batterRun: event, extraRun: 0, isWicket: false };

  if (event === "wicket") {
    delivery = { batterRun: 0, extraRun: 0, isWicket: true };
  }

  if (isExtra) {
    delivery = { batterRun: 0, extraRun: event, isWicket: false };
    summary.extras += event;
  }

  return delivery;
};

const processDelivery = (event, innings, isExtra) => {
  let matchData = { ...innings };

  const { over } = matchData.summary;
  const delivery = createDelivery(event, isExtra, matchData.summary);

  if (hasMatchFinished(matchData.summary)) {
    const updatedMatchData = endMatch(matchData);
    return updatedMatchData;
  }

  if (hasInningFinished(matchData.summary)) {
    matchData = endInning(matchData);
  }

  if (hasOverFinished(over)) {
    startNewOver(over, matchData);
  }

  const updatedData = addDelivery(delivery, matchData, isExtra);

  return updatedData;
};

export const processEvent = (event, isExtra) => {
  const matchData = readFromJson("./data/match.json");
  const updatedData = processDelivery(event, matchData, isExtra);
  writeToJson("./data/match.json", updatedData);

  return updatedData.summary;
};

startMatch();

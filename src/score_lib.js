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

export const generateDelivery = (delivery) => {
  return {
    over: updateBalls(delivery.over),
    score: delivery.score,
    total: delivery.total + delivery.score,
  };
};

const addDelivery = (run, innings) => {
  const matchData = { ...innings };

  const { inning, over } = matchData.summary;
  const delivery = { run };
  const overCount = updateBalls(over);
  matchData[inning][Math.floor(over)].deliveries.push(delivery);
  matchData.summary.total += run;
  matchData.summary["over"] = overCount;
  return matchData;
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


const writeToJson = (path, content) =>
  Deno.writeTextFileSync(path, JSON.stringify(content));

export const startMatch = () => {
  const summary = { over: 0, total: 0, inning: 0, target: 0 };
  const innings = startInning({}, 0);
  innings.summary = summary;
  startOver(0, innings);
  writeToJson("./data/match.json", innings)
  return innings;
};

const match = startMatch();

export const processDeliveries = (run) => {
  addDelivery(run, match);
  writeToJson("./data/match.json", match);
  return match.summary
  // return match;
};

// processDeliveries(1);

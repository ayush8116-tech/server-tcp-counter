export const getHtmlTemplate = (match) => {
  return `<html>
  <body>
    <h1>Score : ${match.total}</h1>
    <h3>Over : ${match.over}</h3>
    <h3><a href="/counter/zero">ZERO</a><br><a href="/counter/one">ONE</a><br><a href="/counter/two">TWO</a><br><a href="/counter/three">THREE</a><br><a href="/counter/four">FOUR</a><br><a href="/counter/five">FIVE</a><br><a href="/counter/six">SIX</a><br><br><a href="/counter/undo">UNDO</a></h3>
    <h3><a href="/">RESET</a></h3>
  </body>
</html>`;
};

import { Button, Col, Container, Row } from "reactstrap";
import React from "react";
import { useParams, Redirect } from "react-router-dom";
import { contest2019, load2019 } from "../data/DataLoader";
import { earnedPoint, formatRank } from "../util";
export default () => {
  const { userId } = useParams();
  const data = load2019();
  const user = data.find(d => d.id === userId);
  if (!user) {
    return <Redirect to="/" />;
  }
  const rank = data.filter(d => d.point > user.point).length + 1;
  const countryRank =
    data.filter(
      d =>
        d.point > user.point && d.user_info.country === user.user_info.country
    ).length + 1;

  const contests = contest2019();
  const results: {
    contest: { id: string; title: string; date: string; writers: string[] };
    contestRank: string;
    earned: number | undefined;
  }[] = [];
  Object.entries(user.result).forEach(([contestId, contestRank]) => {
    const contest = contests.find(c => c.id === contestId);
    if (contestRank && contest) {
      results.push({
        contest,
        contestRank: formatRank(contestRank),
        earned: earnedPoint(contestRank)
      });
    }
  });
  user.writer.forEach(contestId => {
    const contest = contests.find(c => c.id === contestId);
    if (contest) {
      results.push({
        contest,
        contestRank: "Writer",
        earned: undefined
      });
    }
  });
  results.sort((a, b) => b.contest.date.localeCompare(a.contest.date));

  return (
    <Container fluid style={{ backgroundColor: "white" }}>
      <Row
        style={{
          backgroundImage:
            "url('https://cdn.pixabay.com/photo/2017/08/24/03/41/milky-way-2675322_960_720.jpg')",
          color: "white",
          textShadow: "0px 0px 6px #000"
        }}
      >
        <Container>
          <Row className="py-4">
            <Col sm="3" xs="1">
              <img
                width="100%"
                src={user.user_info.image_url}
                className="rounded-circle"
                alt={user.id}
              />
            </Col>
            <Col sm="9" xs="12">
              <Row>
                <h1 className="display-1" style={{ fontWeight: "bold" }}>
                  {user.id}
                </h1>
              </Row>
              <Row>
                <h2>{user.user_info.country}</h2>
              </Row>
              <Row>
                <h2>{Math.round(user.point * 10) / 10} pt</h2>
              </Row>
            </Col>
          </Row>
        </Container>
      </Row>
      <Row>
        <Container>
          <Row className="py-2">
            <h1>Ranks</h1>
          </Row>
          <Row>
            <Col sm="3" className="px-0">
              <h2>Global {formatRank(rank)}</h2>
            </Col>
            <Col sm="9">
              <h2>
                {user.user_info.country} {formatRank(countryRank)}
              </h2>
            </Col>
          </Row>
          <Row className="py-2 mt-4">
            <h1>Season Overview</h1>
          </Row>
          {results.map(r => (
            <Row key={r.contest.id} className="mb-4">
              <Col sm="2" className="px-0">
                <h2>{r.contestRank}</h2>
              </Col>
              <Col sm="5" md="9">
                <Row>
                  <h3>
                    <a href={`https://atcoder.jp/contests/${r.contest.id}/`}>
                      {r.contest.title}
                    </a>
                  </h3>
                </Row>
                <Row style={{ color: "gray" }}>
                  <h5>
                    <span style={{ fontWeight: "bold" }}>Date:</span>{" "}
                    {r.contest.date}
                  </h5>
                </Row>
                {r.earned ? (
                  <Row style={{ color: "gray" }}>
                    <h5>
                      <span style={{ fontWeight: "bold" }}>Point Earned:</span>{" "}
                      {r.earned}
                    </h5>
                  </Row>
                ) : null}
                <Row>
                  <a
                    href={`https://atcoder.jp/contests/${r.contest.id}/standings`}
                  >
                    <Button>View Results</Button>
                  </a>
                </Row>
              </Col>
            </Row>
          ))}
        </Container>
      </Row>
    </Container>
  );
};

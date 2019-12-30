import React from "react";
import { Col, Container, Row } from "reactstrap";
import { load2019 } from "../data/DataLoader";
import { useHistory } from "react-router-dom";

export default () => {
  const standings = load2019().sort((a, b) => b.point - a.point);
  const ranks: Array<number> = [];
  standings.forEach((e, i) => {
    if (i > 0 && standings[i - 1].point === standings[i].point) {
      ranks.push(ranks[i - 1]);
    } else {
      ranks.push(i + 1);
    }
  });

  const history = useHistory();

  return (
    <Container
      fluid
      style={{
        backgroundImage:
          "url('https://cdn.pixabay.com/photo/2017/08/24/03/41/milky-way-2675322_960_720.jpg')"
      }}
    >
      <Container>
        <Row>
          <Col sm="12">
            {standings.map((user, i) => (
              <Row
                onClick={() => {
                  history.push({ pathname: `/user/${user.id}` });
                }}
                key={user.id}
                className="align-items-center py-2 my-2 rounded-lg"
                style={{
                  backgroundColor: "rgba(128, 128, 128, 0.7)"
                }}
              >
                <Col
                  xs="2"
                  lg="2"
                  className="align-self-center"
                  style={{
                    fontWeight: "bold",
                    fontSize: "x-large",
                    textAlign: "center"
                  }}
                >
                  <p
                    style={{
                      display: "inline",
                      color: ranks[i] <= 8 ? "gold" : "white"
                    }}
                  >
                    {ranks[i]}
                  </p>
                </Col>
                <Col xs="3" lg="1">
                  <img
                    width="100%"
                    src={user.user_info.image_url}
                    className="rounded-circle"
                    alt={user.id}
                  />
                </Col>
                <Col xs="5" lg="7" className="align-self-center">
                  <Row
                    style={{
                      fontWeight: "bold",
                      fontSize: "xx-large",
                      color: "white",
                      textShadow: "0px 0px 6px #000"
                    }}
                  >
                    {user.id}
                  </Row>
                  <Row
                    style={{
                      fontSize: "large",
                      color: "LightGray"
                    }}
                  >
                    {user.user_info.country}
                  </Row>
                </Col>

                <Col
                  xs="2"
                  className="align-self-center"
                  style={{
                    fontWeight: "bold",
                    color: "white",
                    textShadow: "0px 0px 6px #000"
                  }}
                >
                  <Row>Point</Row>
                  <Row style={{ fontSize: "x-large" }}>
                    {Math.round(user.point * 10) / 10}
                  </Row>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

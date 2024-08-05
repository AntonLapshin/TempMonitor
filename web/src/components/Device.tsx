import { styled } from "../stitches.config";
import { adjustTemperature } from "../tools/adjustTemperature";
import { celsiusToFahrenheit } from "../tools/celsiusToFahrenheit";
import { fahrenheitToCelsius } from "../tools/fahrenheitToCelsius";
import { DeviceStats } from "../tools/getDeviceStats";
import { timeAgo } from "../tools/timeAgo";
import { Col, Row, Text } from "./Primitives";

const Card = styled(Col, {
  borderRadius: 12,
  backgroundColor: "white", //"#242b33",
  boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
});

export const Device = ({
  deviceName,
  latestRecord,
}: // tempTrend,
// humidityTrend,
DeviceStats) => {
  const actualTemperatureF = celsiusToFahrenheit(latestRecord.temperature);
  const adjustedTemperatureF = adjustTemperature(actualTemperatureF);
  const adjustedTemperatureC = fahrenheitToCelsius(adjustedTemperatureF);

  return (
    <Card>
      <Col
        css={{
          width: "100%",
          gap: "0.75rem",
          padding: "1rem",
          borderBottom: "1px solid $borderColor",
        }}
      >
        <Text color="subtle" css={{ fontSize: 12 }}>
          {deviceName}
        </Text>
        <Text color="subtle" css={{ fontSize: 10 }}>
          {timeAgo(latestRecord.timestamp)}
        </Text>
        <Text css={{ fontSize: 26, fontWeight: 500 }}>
          {adjustedTemperatureC.toFixed(1)}°C
        </Text>
        <Text color="subtle" css={{ fontSize: 18 }}>
          {adjustedTemperatureF.toFixed(1)}°F
        </Text>
      </Col>
      <Col
        css={{
          width: "100%",
          gap: "0.75rem",
          padding: "1rem",
          borderBottom: "1px solid $borderColor",
        }}
      >
        <Row css={{ gap: "0.5rem" }}>
          <Text color="subtle">RH:</Text>
          {latestRecord.humidity.toFixed(1)}%
        </Row>
      </Col>
    </Card>
  );
};

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>

DHT dht11(4, DHT11);

const char* ssid = "";
const char* password = "";
const char* userId = "";
const char* deviceName = "Garage";
const char* lambdaUrl = "";
const char* apiKey = "";

const unsigned long sendInterval = 10 * 60 * 1000;
long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  dht11.begin();
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - lastSendTime >= sendInterval) {
    float humidity = dht11.readHumidity();
    float temperature = dht11.readTemperature();
    
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      sendDataToLambda(temperature, humidity);
    }

    lastSendTime = currentTime;
  } 
  // else {
  //   Serial.println("Too early");
  //   Serial.println("Current time " + String(currentTime));
  // }

  // Add a small delay to prevent excessive looping
  delay(5000);
}

void sendDataToLambda(float temperature, float humidity) {
  WiFiClientSecure client;
  client.setInsecure(); // Only use this for testing. In production, use proper SSL certificate validation.
  HTTPClient http;
  
  Serial.print("[HTTP] begin...\n");
  if (http.begin(client, lambdaUrl)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);
    
    String postData = "{\"userId\":\"" + String(userId) + 
                  "\",\"deviceName\":\"" + String(deviceName) + 
                  "\",\"temperature\":" + String(temperature, 2) + 
                  ",\"humidity\":" + String(humidity, 2) + "}";
    
    Serial.println("Sending data: " + postData);
    
    Serial.print("[HTTP] POST...\n");
    int httpCode = http.POST(postData);
    
    if (httpCode > 0) {
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);
      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
        String payload = http.getString();
        Serial.println("Response: " + payload);
      } else {
        Serial.println("Error response: " + http.getString());
      }
    } else {
      Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
  } else {
    Serial.printf("[HTTP] Unable to connect\n");
  }
}
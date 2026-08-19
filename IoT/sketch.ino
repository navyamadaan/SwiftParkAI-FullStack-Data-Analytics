#include <WiFi.h>
#include <HTTPClient.h>

int TRIG_PIN = 5;
int ECHO_PIN = 18;
float ss = 0.034;
long duration;
float dist_cm;
bool occupied;
bool lastState=false;
HTTPClient http;


void setup() {
  Serial.begin(115200);    //baud speed
  WiFi.begin("Wokwi-GUEST", "");

  while(WiFi.status()!= WL_CONNECTED){
    Serial.print(".");
    delay(500);
  }
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN,LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN,HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN,LOW);

  duration=pulseIn(ECHO_PIN,HIGH,30000);

  if(duration==0){
    Serial.println("Out of Range");
  }

  else{
    // measure distance
    dist_cm = (duration*ss)/2;
    Serial.print("distance = ");
    Serial.println(dist_cm);
    Serial.println("cm");
    
    if(dist_cm < 50){
      occupied = true;
    }
    else{
      occupied= false;
    }

    //check if state changed
    if(occupied!=lastState){
      // if it has changed, send the HTTP request
      if(occupied != lastState){
      if(WiFi.status() == WL_CONNECTED){
        // 1. Initialize with your LocalTunnel URL
        http.begin("https://swift-park-navya.loca.lt");
        
        // 2. Standard settings for reliability
        http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);
        http.setTimeout(15000); // 15 seconds is usually enough for LocalTunnel
        
        // 3. Only the essential JSON header is needed now
        http.addHeader("Content-Type", "application/json");

        // 4. Construct JSON payload
        String payload = "{\"spotId\": 1, \"occupied\": " + String(occupied ? "true" : "false") + "}";

        // 5. Send the POST request
        Serial.println("Sending update to SwiftParkAI...");
        int httpResponseCode = http.POST(payload);

        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        
        http.end();
        lastState = occupied;
      }
    }
  }
  delay(1000); 
}
}
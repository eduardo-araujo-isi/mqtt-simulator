import fs from "fs";
import mqtt from "mqtt";
import path from "path";
import { fileURLToPath } from "url";
import type { Payload } from "./types/payload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateTopic(topic: string): string {
  if (topic.includes("+")) {
    return topic.replace("+", Math.floor(Math.random() * 100).toString());
  }
  return topic;
}

function generateRandomArray(
  length: number,
  min: number,
  max: number,
  isFloat: boolean = false
): number[] {
  return Array.from({ length }, () =>
    isFloat
      ? +(Math.random() * (max - min) + min).toFixed(2)
      : Math.floor(Math.random() * (max - min + 1) + min)
  );
}

function buildPayload(frameCount: number = 5): Payload {
  return {
    timestamp: Array.from({ length: frameCount }, () => Date.now()),
    frameCounter: generateRandomArray(frameCount, 1, 1000, false),
    centerXAbs: generateRandomArray(frameCount, 0, 1920, false),
    centerYAbs: generateRandomArray(frameCount, 0, 1080, false),
    areaPixels: generateRandomArray(frameCount, 100, 5000, true),
    particleWidth: generateRandomArray(frameCount, 10, 200, true),
    particleHeight: generateRandomArray(frameCount, 10, 200, true),
  };
}

function loadJson(file: string) {
  const filePath = path.join(__dirname, file);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const client = mqtt.connect("mqtt://localhost:1883");

const topics: string[] = loadJson("topics.json").topics;

client.on("connect", () => {
  console.log("✅ Conectado ao broker MQTT");

  setInterval(() => {
    for (let i = 0; i < topics.length; i++) {
      const topic = generateTopic(topics[i] ?? "");

      const data = buildPayload();

      client.publish(topic, JSON.stringify(data));
      console.log(`📤 Publicado em [${topic}] =>`, data);
    }
  }, 2000);
});

client.on("error", (err) => {
  console.error("Erro de conexão MQTT:", err);
});

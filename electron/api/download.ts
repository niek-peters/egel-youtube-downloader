import express from "express";
import EventEmitter from "events";

import { muxHighestQuality } from "../scripts/muxer";

const eventEmitter = new EventEmitter();

const router = express.Router();

router.get("/events", (_req, res) => {
  eventEmitter.removeAllListeners();

  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Tell the client to retry every 10 seconds if connectivity is lost
  res.write("retry: 10000\n\n");

  eventEmitter.on("finishedProcessing", (fileName) => {
    console.log("Finished processing");
    res.write(
      `data: ${JSON.stringify({ status: "processingComplete", fileName })}\n\n`
    );
  });
});

router.get("/:uid", async (req, res) => {
  const uid = req.params.uid;
  const url = `https://youtu.be/${uid}`;

  if (typeof url !== "string") return res.status(400).send("Invalid URL");

  console.log("Handling download...");

  muxHighestQuality(url, (_fileDir, fileName, error) => {
    if (error) return res.status(500).send(error);
    eventEmitter.emit("finishedProcessing", fileName);
  });
});

export default router;

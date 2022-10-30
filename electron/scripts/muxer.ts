/* eslint-disable @typescript-eslint/ban-ts-comment */
import downloadsFolder from "downloads-folder";
import fs from "fs";

import ytdl from "ytdl-core";
import ffmpeg from "ffmpeg-static";
import cp from "child_process";

const outputDir = downloadsFolder();

export function muxHighestQuality(
  link: string,
  callback: (fileDir: string, fileName: string, error?: string) => void
): void {
  try {
    ytdl.getInfo(link).then((info) => {
      if (!ffmpeg) return;

      let ffmpegPath = ffmpeg;

      ffmpegPath = ffmpeg.replace("app.asar", "app.asar.unpacked");

      console.log(ffmpegPath);

      const audioStream = ytdl.downloadFromInfo(info, {
        quality: "highestaudio",
      });
      const videoStream = ytdl.downloadFromInfo(info, {
        quality: "highestvideo",
      });

      let title = info.videoDetails.title;
      title = title.replace(/[/\\?*:|"<>]/g, "");

      const fileName = getUniqueFileName(`${title}.mp4`);
      const fileDir = `${outputDir}/${fileName}`;

      // create the ffmpeg process for muxing
      const ffmpegProcess = cp.spawn(
        ffmpegPath,
        [
          // supress non-crucial messages
          "-loglevel",
          "8",
          "-hide_banner",

          // input audio by pipe
          "-i",
          "pipe:3",

          // input video by pipe
          "-i",
          "pipe:4",

          // map audio and video correspondingly
          "-map",
          "0:a",
          "-map",
          "1:v",

          // no need to change the codec
          "-c",
          "copy",
          "-preset",
          "ultrafast",

          // output file
          fileDir,
        ],
        {
          // no popup window for Windows users
          windowsHide: true,
          stdio: [
            // silence stdin/out, forward stderr,
            "inherit",
            "inherit",
            "inherit",
            // and pipe audio, video
            "pipe",
            "pipe",
          ],
        }
      );

      ffmpegProcess.on("close", () => callback(fileDir, fileName));

      //@ts-ignore
      audioStream.pipe(ffmpegProcess.stdio[3]);
      //@ts-ignore
      videoStream.pipe(ffmpegProcess.stdio[4]);
    });
  } catch (err) {
    if (err as Error) {
      const error = err as Error;

      callback("", "", error.message);
    }
  }
}

function getUniqueFileName(fileName: string, index = 1): string {
  const fileDir = `${outputDir}/${fileName}`;
  const fileNumberRegex = /\(([0-9]+)\)\.(?![\s\S]*\(([0-9]+)\)\.)/;

  let newFileName = fileName;

  // Stop the recursion if the file doesn't exist
  if (!fs.existsSync(fileDir)) return newFileName;

  // If the file already exists, try again with a new index
  if (fileNumberRegex.test(fileName)) {
    newFileName = fileName.replace(fileNumberRegex, `(${index}).`);
  } else {
    newFileName = fileName.replace(/\.(?![\s\S]*\.)/, ` (1).`);
  }

  // Try again with the new file name
  return getUniqueFileName(newFileName, index + 1);
}

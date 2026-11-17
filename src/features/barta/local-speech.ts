import "server-only";
import { prepareSpeechText } from "./barta-spoken-text";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const maxWavBytes = 24_000_000;

export async function synthesizeLocalSpeech(
  executable: string,
  text: string,
  language: "bn" | "en",
  signal: AbortSignal,
): Promise<Uint8Array<ArrayBuffer>> {
  const directory = await mkdtemp(join(tmpdir(), "prohor-barta-"));
  try {
    const output = join(directory, "speech.wav");
    await new Promise<void>((resolve, reject) => {
      const child = spawn(executable, [
        "-b", "1", "-v", language === "bn" ? "bn" : "en-gb", "-s", language === "bn" ? "140" : "150", "-g", "2", "-w", output, "--stdin",
      ], {
        shell: false, windowsHide: true, stdio: ["pipe", "ignore", "ignore"], signal,
        timeout: 10_000,
      });
      let failure: Error | undefined;
      child.once("error", (error) => { failure = error; });
      child.once("close", (code) => {
        if (code === 0 && !failure) resolve();
        else reject(failure ?? new Error("Local speech synthesis failed"));
      });
      child.stdin.on("error", (error) => {
        failure ??= error;
        child.kill();
      });
      child.stdin.end(prepareSpeechText(text, language), "utf8");
    });
    const file = await stat(output);
    if (file.size <= 44 || file.size > maxWavBytes) throw new Error("Invalid WAV size");
    const bytes = await readFile(output);
    if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") {
      throw new Error("Invalid WAV format");
    }
    return new Uint8Array(bytes);
  } finally {
    await rm(directory, { recursive: true, force: true, maxRetries: 2 });
  }
}

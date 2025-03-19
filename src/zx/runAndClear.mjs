export async function runAndClear(f) {
  let outputLines = 0;
  let errorOccurred = false;
  const proc = f();

  proc.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");

    for (const line of lines) {
      if (line.trim() !== "") {
        console.log(line);
        outputLines++;
      }
    }
  } );

  proc.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");

    for (const line of lines) {
      if (line.trim() !== "") {
        console.error(line);
        outputLines++;
      }
    }
  } );

  try {
    await proc;
  } catch {
    errorOccurred = true;
  }

  if (!errorOccurred) {
    for (let i = -1; i < outputLines; i++) {
      // "\r\x1b[2K" borra la línea actual y "\x1b[A" sube una línea
      process.stdout.write("\r\x1b[2K");

      if (i < outputLines - 1)
        process.stdout.write("\x1b[A");
    }
  }
}

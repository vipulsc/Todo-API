import fs from "fs/promises";

export async function loadFile(fileName) {
  try {
    const data = await fs.readFile(fileName, "utf-8");
    console.log("data--> ", data); //checkcheck
    if (!data.trim()) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error("Invalid JSON in file:", parseError);
      return [];
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(fileName, "[]", "utf-8");
    } else {
      console.error("Error reading file:", error);
    }
    return [];
  }
}

//write file

export async function editFile(fileName, body) {
  try {
    await fs.writeFile(fileName, JSON.stringify(body, null, 2), "utf-8");
  } catch (error) {
    console.error("Error loading file:", error);
    throw error;
  }
}

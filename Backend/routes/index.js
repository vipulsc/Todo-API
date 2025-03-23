import fs from "fs/promises";

export async function loadFile(fileName) {
  try {
    const data = await fs.readFile(fileName, "utf-8");
    console.log("data--> ", data); //checkcheck

    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    return error;
  }
}

//write file

export async function editFile(fileName, body) {
  try {
    await fs.writeFile(fileName, JSON.stringify(body, null, 2), "utf-8");
  } catch (error) {
    throw error;
  }
}

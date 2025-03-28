import fs from "fs/promises";
import path from "path";

//read file function
export async function loadFile(fileName) {
  const filePath = path.resolve(fileName);
  console.log(`JSON file location: ${filePath}`);
  try {
    const data = await fs.readFile(fileName, "utf-8");
    console.log(`File content (${fileName}):`, data);
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
      return [];
    } else {
      console.error("Error reading file:", error);
    }
    return [];
  }
}

//write file function
export async function editFile(fileName, body) {
  try {
    await fs.writeFile(fileName, JSON.stringify(body, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
}

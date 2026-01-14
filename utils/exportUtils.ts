
import { GeneratedStructure, Voxel } from "../types";

export function generatePackMcMeta(): string {
  return JSON.stringify({
    pack: {
      pack_format: 15,
      description: "AI Minecraft Structure Builder Datapack"
    }
  }, null, 2);
}

export function generateCommandFile(structure: GeneratedStructure): string {
  const { voxels, blueprint } = structure;
  const fileName = blueprint.name.toLowerCase().replace(/\s+/g, '_');
  
  let content = `#####################################################\n`;
  content += `# AI MINECRAFT BUILDER - COMMAND SCRIPT\n`;
  content += `# Structure: ${blueprint.name}\n`;
  content += `# Blocks: ${voxels.length}\n`;
  content += `#####################################################\n\n`;
  
  content += `# DATAPACK INSTALLATION GUIDE:\n`;
  content += `# 1. Create folder: .minecraft/saves/[World]/datapacks/builder_ai/\n`;
  content += `# 2. Create file: builder_ai/pack.mcmeta (Use the "Copy pack.mcmeta" button in the app)\n`;
  content += `# 3. Create folder path: builder_ai/data/mybuilds/functions/\n`;
  content += `# 4. Rename THIS file to: ${fileName}.mcfunction\n`;
  content += `# 5. Place it in the 'functions' folder created in Step 3.\n`;
  content += `# 6. In-game, type: /reload\n`;
  content += `# 7. In-game, type: /function mybuilds:${fileName}\n\n`;
  
  content += `# COMMANDS:\n`;
  voxels.forEach(v => {
    content += `setblock ~${v.x} ~${v.y} ~${v.z} ${v.blockId}\n`;
  });

  return content;
}

export function downloadFile(content: string | Uint8Array, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

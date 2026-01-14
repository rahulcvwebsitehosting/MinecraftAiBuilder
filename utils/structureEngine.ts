
import { StructureBlueprint, Voxel, BlockData } from "../types";
import { BLOCK_COLORS } from "../constants";

const VALID_BLOCKS = new Set([
  'minecraft:stone', 'minecraft:stone_bricks', 'minecraft:cobblestone', 'minecraft:mossy_stone_bricks',
  'minecraft:andesite', 'minecraft:polished_andesite', 'minecraft:diorite', 'minecraft:polished_diorite',
  'minecraft:deepslate', 'minecraft:polished_deepslate', 'minecraft:deepslate_bricks', 'minecraft:deepslate_tiles',
  'minecraft:oak_planks', 'minecraft:spruce_planks', 'minecraft:birch_planks', 'minecraft:jungle_planks',
  'minecraft:dark_oak_planks', 'minecraft:mangrove_planks', 'minecraft:cherry_planks',
  'minecraft:oak_log', 'minecraft:spruce_log', 'minecraft:birch_log', 'minecraft:dark_oak_log',
  'minecraft:stripped_oak_log', 'minecraft:stripped_spruce_log', 'minecraft:oak_wood', 'minecraft:spruce_wood',
  'minecraft:glass', 'minecraft:glass_pane', 'minecraft:white_stained_glass', 'minecraft:cyan_stained_glass',
  'minecraft:white_concrete', 'minecraft:gray_concrete', 'minecraft:black_concrete', 'minecraft:quartz_block',
  'minecraft:smooth_quartz', 'minecraft:smooth_quartz_stairs', 'minecraft:smooth_quartz_slab',
  'minecraft:smooth_stone', 'minecraft:smooth_stone_slab', 'minecraft:sandstone', 'minecraft:red_sandstone',
  'minecraft:grass_block', 'minecraft:dirt', 'minecraft:sand', 'minecraft:gravel', 'minecraft:water',
  'minecraft:torch', 'minecraft:lantern', 'minecraft:soul_lantern', 'minecraft:glowstone', 'minecraft:sea_lantern',
  'minecraft:oak_stairs', 'minecraft:spruce_stairs', 'minecraft:stone_brick_stairs', 'minecraft:dark_oak_stairs',
  'minecraft:oak_slab', 'minecraft:spruce_slab', 'minecraft:stone_brick_slab', 'minecraft:dark_oak_slab',
  'minecraft:oak_fence', 'minecraft:spruce_fence', 'minecraft:iron_bars', 'minecraft:oak_door', 'minecraft:spruce_door',
  'minecraft:oak_trapdoor', 'minecraft:white_bed', 'minecraft:red_bed', 'minecraft:chest', 'minecraft:barrel',
  'minecraft:furnace', 'minecraft:blast_furnace', 'minecraft:smoker', 'minecraft:crafting_table', 'minecraft:bookshelf', 
  'minecraft:lectern', 'minecraft:cauldron', 'minecraft:brewing_stand', 'minecraft:flower_pot',
  'minecraft:poppy', 'minecraft:blue_orchid', 'minecraft:white_wool', 'minecraft:gray_wool', 'minecraft:cyan_wool',
  'minecraft:oak_leaves', 'minecraft:spruce_leaves', 'minecraft:azalea_leaves', 'minecraft:flowering_azalea_leaves',
  'minecraft:tinted_glass', 'minecraft:bamboo_planks', 'minecraft:mangrove_log', 'minecraft:painting', 'minecraft:item_frame'
]);

function getSafeBlock(blockId: string | undefined, defaultId: string = 'minecraft:stone'): string {
  if (!blockId) return defaultId;
  let id = blockId.toLowerCase().trim();
  if (!id.startsWith('minecraft:')) id = `minecraft:${id}`;
  id = id.replace(/_plank$/, '_planks').replace(/_brick$/, '_bricks');
  if (VALID_BLOCKS.has(id)) return id;
  if (id.includes('stairs')) return 'minecraft:oak_stairs';
  if (id.includes('slab')) return 'minecraft:oak_slab';
  if (id.includes('door')) return 'minecraft:oak_door';
  if (id.includes('log')) return 'minecraft:oak_log';
  if (id.includes('glass')) return id.includes('pane') ? 'minecraft:glass_pane' : 'minecraft:glass';
  if (id.includes('wood') || id.includes('plank')) return 'minecraft:oak_planks';
  if (id.includes('stone')) return 'minecraft:stone_bricks';
  return defaultId;
}

interface Room {
  x: number;
  z: number;
  w: number;
  d: number;
  y: number;
  type: 'living' | 'kitchen' | 'bedroom' | 'library' | 'bathroom' | 'cinema' | 'dining';
}

export function buildVoxels(blueprint: StructureBlueprint): { voxels: Voxel[], materials: BlockData[] } {
  const voxels: Voxel[] = [];
  const materialCounts: Record<string, number> = {};
  const blockMap = new Map<string, string>();

  const addBlock = (x: number, y: number, z: number, blockId: string) => {
    const safeId = getSafeBlock(blockId);
    blockMap.set(`${x},${y},${z}`, safeId);
    materialCounts[safeId] = (materialCounts[safeId] || 0) + 1;
  };

  const dims = blueprint.dimensions || { width: 32, height: 20, depth: 32 };
  const W = dims.width || 32;
  const H = dims.height || 20;
  const D = dims.depth || 32;
  const levels = blueprint.metadata?.levels || 2;
  const cantileverDepth = blueprint.metadata?.cantilever_depth || 4;
  const mats = blueprint.materials;

  const floorHeight = Math.floor(H / levels);

  // --- ROOM SYSTEM ---
  const rooms: Room[] = [];
  for (let l = 0; l < levels; l++) {
    const yBase = l * floorHeight;
    const isGround = l === 0;

    if (isGround) {
      rooms.push({ x: 2, z: 2, w: Math.floor(W * 0.4), d: Math.floor(D * 0.7), y: yBase, type: 'living' });
      rooms.push({ x: Math.floor(W * 0.45) + 2, z: 2, w: Math.floor(W * 0.3), d: Math.floor(D * 0.3), y: yBase, type: 'kitchen' });
      rooms.push({ x: Math.floor(W * 0.45) + 2, z: Math.floor(D * 0.4), w: Math.floor(W * 0.3), d: Math.floor(D * 0.4), y: yBase, type: 'dining' });
    } else {
      const cOffset = -cantileverDepth;
      rooms.push({ x: cOffset + 2, z: 2, w: 10, d: 8, y: yBase, type: 'bedroom' });
      rooms.push({ x: cOffset + 2, z: 12, w: 10, d: 8, y: yBase, type: 'bedroom' });
      rooms.push({ x: 12, z: 2, w: 6, d: 6, y: yBase, type: 'bathroom' });
      rooms.push({ x: 12, z: 10, w: 8, d: 10, y: yBase, type: 'library' });
    }
  }

  // Terrain
  for (let x = -20; x < W + 20; x++) {
    for (let z = -20; z < D + 20; z++) {
      addBlock(x, -2, z, 'minecraft:dirt');
      addBlock(x, -1, z, 'minecraft:grass_block');
    }
  }

  const getIsInFootprint = (x: number, z: number, y: number) => {
    const levelIdx = Math.floor(y / floorHeight);
    const isGroundCore = x >= 0 && x < Math.floor(W * 0.75) && z >= 0 && z < D;
    const isGroundWing = x >= 0 && x < W && z >= 0 && z < Math.floor(D * 0.5);
    if (levelIdx === 0) return isGroundCore || isGroundWing;
    const isUpperCore = x >= -cantileverDepth && x < Math.floor(W * 0.7) && z >= 0 && z < Math.floor(D * 0.95);
    return isUpperCore;
  };

  const isOuterWall = (x: number, z: number, y: number) => {
    if (!getIsInFootprint(x, z, y)) return false;
    return !getIsInFootprint(x + 1, z, y) || !getIsInFootprint(x - 1, z, y) || !getIsInFootprint(x, z + 1, y) || !getIsInFootprint(x, z - 1, y);
  };

  // MAIN BUILD LOOP
  for (let y = 0; y < H; y++) {
    const yInLevel = y % floorHeight;
    const isFloor = yInLevel === 0;
    const isCeiling = yInLevel === floorHeight - 1;

    for (let x = -cantileverDepth - 4; x < W + 4; x++) {
      for (let z = -cantileverDepth - 4; z < D + 4; z++) {
        if (!getIsInFootprint(x, z, y)) continue;

        const wall = isOuterWall(x, z, y);

        if (wall) {
          const isWindow = yInLevel >= 1 && yInLevel <= floorHeight - 2 && (x % 4 !== 0 && z % 4 !== 0);
          if (isWindow) {
            addBlock(x, y, z, mats.glass_type || 'minecraft:glass_pane');
          } else {
            addBlock(x, y, z, mats.walls || 'minecraft:white_concrete');
          }
        } else if (isFloor) {
          addBlock(x, y, z, mats.floor || 'minecraft:oak_planks');
        } else if (isCeiling) {
          addBlock(x, y, z, mats.roof || 'minecraft:smooth_quartz');
          if (x % 6 === 3 && z % 6 === 3) addBlock(x, y, z, 'minecraft:sea_lantern');
        } else {
          // Internal Walls
          rooms.forEach(r => {
            if (y >= r.y && y < r.y + floorHeight) {
              const onWallX = x === r.x || x === r.x + r.w - 1;
              const onWallZ = z === r.z || z === r.z + r.d - 1;
              const withinX = x >= r.x && x < r.x + r.w;
              const withinZ = z >= r.z && z < r.z + r.d;
              if ((onWallX && withinZ) || (onWallZ && withinX)) {
                const isDoor = (x === Math.floor(r.x + r.w/2) || z === Math.floor(r.z + r.d/2)) && yInLevel < 3;
                if (!isDoor) addBlock(x, y, z, 'minecraft:white_concrete');
              }
            }
          });
        }
      }
    }
  }

  // Furniture placement
  rooms.forEach(r => {
    const fx = r.x + 2;
    const fz = r.z + 2;
    const fy = r.y + 1;
    if (r.type === 'bedroom') {
      addBlock(fx, fy, fz, 'minecraft:white_bed');
      addBlock(fx + 1, fy, fz, 'minecraft:white_bed');
      addBlock(fx, fy, fz + 1, 'minecraft:oak_slab');
    } else if (r.type === 'kitchen') {
      addBlock(r.x + 1, fy, r.z + 1, 'minecraft:smoker');
      addBlock(r.x + 2, fy, r.z + 1, 'minecraft:blast_furnace');
      addBlock(r.x + 1, fy, r.z + 2, 'minecraft:cauldron');
    } else if (r.type === 'living') {
      for (let i = 0; i < 4; i++) addBlock(r.x + 2 + i, fy, r.z + 2, 'minecraft:white_wool');
    }
  });

  blockMap.forEach((blockId, pos) => {
    const [x, y, z] = pos.split(',').map(Number);
    voxels.push({ x, y, z, blockId, color: BLOCK_COLORS[blockId] || '#cccccc' });
  });

  const materials: BlockData[] = Object.entries(materialCounts).map(([id, count]) => ({
    id,
    name: id.replace('minecraft:', '').replace(/_/g, ' ').toUpperCase(),
    count
  }));

  return { voxels, materials };
}

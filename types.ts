
export enum StructureSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum MinecraftEdition {
  JAVA = 'java',
  BEDROCK = 'bedrock'
}

export interface BlockData {
  id: string;
  name: string;
  count: number;
}

export interface Voxel {
  x: number;
  y: number;
  z: number;
  blockId: string;
  color: string;
}

export interface BuildStep {
  title: string;
  description: string;
  coordinates?: string;
  blocksNeeded?: string;
}

export interface BuildPhase {
  name: string;
  estimatedTime: string;
  steps: BuildStep[];
  checkpoint: string;
}

export interface BuildTutorial {
  difficulty: string;
  totalEstimatedTime: string;
  recommendedTools: string[];
  phases: BuildPhase[];
}

export interface StructureBlueprint {
  name: string;
  type: string;
  style: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  metadata?: {
    levels: number;
    cantilever_depth: number;
    has_infinity_pool: boolean;
    unique_blocks_list: string[];
  };
  materials: {
    walls: string;
    wall_variation: string;
    floor: string;
    roof: string;
    accents: string;
    details: string;
    lighting: string;
    has_pool?: boolean;
    accent_wood?: string;
    glass_type?: string;
  };
  features: string[];
  tutorial: BuildTutorial;
}

export interface GeneratedStructure {
  blueprint: StructureBlueprint;
  voxels: Voxel[];
  materials: BlockData[];
  estimatedBuildTime: string;
}

export interface OptimizedPromptData {
  reasoning_steps: string[];
  refined_user_description: string;
  structure_metadata: {
    name: string;
    style: string;
    overall_footprint: {
      width: number;
      depth: number;
      height: number;
    };
    levels: number;
    cantilever_depth: number;
    ground_level_y: number;
    primary_material: string;
    secondary_material: string | null;
    roof_material: string | null;
    window_material: string;
    has_pool: boolean;
    pool_location: string;
    pool_size: {
      length: number;
      width: number;
      depth: number;
    } | null;
    estimated_block_count: number;
    unique_blocks_list: string[];
  };
  high_level_plan: {
    foundation: string;
    main_walls: string;
    roof: string;
    interior: string;
    exterior_details: string;
    pool: string;
  };
  critical_requirements: string[];
}

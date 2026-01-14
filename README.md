# Block Architect
A natural language interface for procedural Minecraft architecture and automated structure generation.

## Description
Block Architect is a web-based utility designed to bridge the gap between conceptual architectural design and in-game implementation within Minecraft. The application allows users to describe complex structures using natural language and transforms those descriptions into precise voxel models.

By leveraging advanced structural reasoning, the tool generates a technical blueprint that includes 3D visualizations, comprehensive material manifests, and executable Minecraft function scripts. It serves as a primary resource for builders who want to streamline the planning phase of large-scale projects or automate the placement of complex geometries.

## Features
* Natural Language Processing: Converts descriptive prompts into structured architectural data.
* Voxel Preview Engine: A dedicated 3D renderer for inspecting generated models, including a 2D compatibility mode for restricted environments.
* Material Manifest: Automatic calculation of required resources, including total block counts and inventory stack requirements.
* Procedural Build Tutorials: Step-by-step instructions for manual construction, categorized by build phases.
* Automated Export: Generation of Minecraft Datapack functions (.mcfunction) for direct in-game structure instantiation.
* Iterative Adjustment: Refine existing designs through follow-up prompts to modify materials, scale, or specific features.

## Tech Stack
* Frontend: React 19, TypeScript
* Styling: Tailwind CSS
* 3D Rendering: Three.js (WebGL)
* Voxel Logic: Custom procedural engine
* Core Logic: Large Language Model (Architectural Reasoning)

## Live Demo
🔗 Live Demo: https://rahul-s.github.io/block-architect/

## Screenshots
[Placeholder for application interface screenshot]
[Placeholder for 3D voxel preview screenshot]
[Placeholder for material manifest screenshot]

## Installation & Setup
### Prerequisites
* Node.js (Latest LTS version recommended)
* NPM or Yarn
* A valid API Key for structural generation

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/rahul-s/block-architect.git
   cd block-architect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   Create a .env file in the root directory and add your API key:
   ```env
   API_KEY=your_api_key_here
   ```

4. Run the application:
   ```bash
   npm start
   ```

## Usage
1. Input: Enter a detailed description of a structure in the text area (e.g., "A modern cliffside villa with floor-to-ceiling windows and a quartz foundation").
2. Technical Review: Use the Technical Review feature to analyze the architectural feasibility and block palette before final generation.
3. Generation: Execute the generator to produce the 3D model and material list.
4. Export: Download the generated .mcfunction file and follow the provided installation guide to move the structure into a Minecraft world.
5. Manual Build: Use the generated tutorial phases to build the structure manually in survival mode if preferred.

## Future Improvements
* Schematic File Export: Support for .schem and .litematic formats to integrate with WorldEdit and Litematica.
* Multi-Biome Adaptation: Automatic adjustment of material palettes based on specific Minecraft biomes.
* Interior Logic: Enhanced procedural generation for internal room layouts and furniture.
* Collaborative Design: Sharing functionality for generated blueprints and material lists.

## Author
Name: Rahul S
Bio: Engineering student and software developer focused on building functional web applications and procedural generation tools.
GitHub: [https://github.com/rahul-s]

## License
This project is licensed under the MIT License.
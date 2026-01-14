# Block Architect
A natural language interface for procedural Minecraft architecture and automated structure generation.

## Description
Block Architect is a technical utility designed to transform conceptual descriptions into precise Minecraft voxel models. The application addresses the planning barrier often encountered in large-scale building projects by automating the translation of architectural intent into technical data.

The tool provides value to Minecraft enthusiasts and technical builders by generating structural blueprints that include 3D visualizations, comprehensive material manifests, and executable function scripts. It streamlines the workflow from design to in-game implementation.

## Features
* Natural Language Translation: Converts descriptive architectural prompts into structured voxel data.
* Dual-Mode Visualization: Features a dedicated 3D WebGL renderer and a fallback 2D blueprint engine for model inspection.
* Material Logistics: Automatically calculates required resources, including total block counts and inventory stack requirements.
* Procedural Construction Guides: Generates step-by-step build phases with coordinate-specific instructions for manual construction.
* Scripted Automation: Produces Minecraft function files (.mcfunction) for direct structure instantiation via datapacks.
* Iterative Design: Allows for real-time adjustments to existing models through refinement prompts.

## Tech Stack
* Frontend Framework: React 19
* Language: TypeScript
* Styling: Tailwind CSS
* 3D Graphics: Three.js (WebGL)
* Core Logic: Large Language Model integration for architectural reasoning and structural optimization.

## Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/rahulcvwebsitehosting/MinecraftAiBuilder.git
   cd MinecraftAiBuilder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   Create a .env file in the root directory and define your API key:
   ```env
   API_KEY=your_technical_api_key
   ```

4. Run the application:
   ```bash
   npm start
   ```

## Usage
Users interact with the application by entering a structural description into the primary input field. The "Technical Review" phase allows for a pre-generation analysis of the build's feasibility and material palette. Once generated, users can inspect the 3D model, review the material list, and download the automation scripts or build guides for use within the Minecraft environment.

## Future Improvements
* Schematic Format Support: Implementation of .schem and .litematic export functionality for WorldEdit and Litematica integration.
* Procedural Interior Logic: Enhanced generation of internal room layouts, furniture, and functional spaces.
* Biome-Aware Palettes: Automated adjustment of construction materials based on specific in-game environmental data.
* API Integration for Blueprints: A library system for saving and sharing generated architectural specifications.

## Author
Rahul S
Engineering student and software developer focused on building functional web applications and procedural generation tools.
LinkedIn: https://www.linkedin.com/in/rahulshyamcivil/
# Wildwood Village — Unreal Engine 5.7 starter

This is the first native Unreal project scaffold for the browser game in `../wildwood-3d/`. It is a separate project so the existing GitHub Pages game remains untouched.

## Included so far

- Unreal Engine 5.7 C++ project/module skeleton.
- Player character with a camera, WASD movement, mouse look, jump, movement-oriented facing, and a short camera lag.
- Press **E** to line-trace from the camera and call the `WildwoodInteractable` interface on actors implementing it.
- Default game mode and legacy input mappings.

This is the migration foundation, not a complete port yet. The project has not been compiled in Unreal Editor in this environment. The village art, level, character mesh/animation, NPC AI, quests, inventory, audio, and UI still need to be built and tested in the editor.

## Windows setup

1. Install Unreal Engine 5.7 or newer using the Epic Games Launcher.
2. Download or clone this repository, then open `UnrealMigration/WildwoodVillage.uproject`.
3. If Unreal offers to rebuild missing modules, choose **Yes**. If it cannot, install Visual Studio 2022 with **Desktop development with C++**, **Game development with C++**, and the Windows SDK, then right-click the `.uproject` and choose **Generate Visual Studio project files**.
4. Open the generated `.sln` in Visual Studio, select **Development Editor** and **Win64**, then build the `WildwoodVillageEditor` target.
5. Open the project in Unreal. Since the village map is not included yet, create a level named `WildwoodVillage` under `Content/Maps`, save it, and set it as both Editor Startup Map and Game Default Map under **Project Settings → Maps & Modes**. The config references this future map by that name.
6. Add a Landscape actor or a large scaled plane, a Directional Light, Sky Atmosphere, Sky Light, and Player Start. Press **Play** to test movement. Use WASD, mouse, Space, and E.

## Next build milestones

1. Create a greybox village map with a central plaza and roads, then place collision-enabled house shells.
2. Create a Blueprint villager implementing `WildwoodInteractable`, then add interaction dialogue.
3. Add NPC AI with Nav Mesh Bounds Volume, AI Controller, and Behavior Tree or a simple Blueprint patrol.
4. Bring in or create a rigged character mesh and animation blueprint; use Unreal's Manny/Quinn as the initial placeholder.
5. Rebuild the bakery, farm, stable, woodcutter hut, orchard, and lake as reusable Blueprint actors.
6. Port quest state, coins, inventory, and interaction feedback into dedicated components and UI widgets.

## Existing browser reference

- Playable browser version: https://Staynotnice.github.io/yeet/wildwood-3d/
- Source: https://github.com/Staynotnice/yeet/tree/main/wildwood-3d

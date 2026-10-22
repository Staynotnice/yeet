# Wildwood Village — Unreal starter kit

This folder contains the first executable step of the Unreal migration: a repeatable editor script that builds a **greybox village level** from Unreal's built-in basic meshes. It is a starting point, not a finished or compiled game. Your existing browser version stays intact.

## Create the project once

1. Open Epic Games Launcher → Unreal Engine → Library, then launch your installed Unreal Engine.
2. Create a **Games → Third Person → Blueprint** project named `WildwoodVillageUE`. Use a new folder separate from this repository; keep the original `yeet` project unchanged.
3. Open the new project and wait for shaders and first-time setup to finish.

## Enable editor scripting

1. In Unreal, open **Edit → Plugins**.
2. Enable **Python Editor Script Plugin** and **Editor Scripting Utilities** (under Scripting).
3. Restart the editor when prompted.

Epic's docs: [Scripting and Automating the Unreal Editor](https://dev.epicgames.com/documentation/en-us/unreal-engine/scripting-and-automating-the-unreal-editor).

## Generate the first village level

1. In this repo, download `unreal/Scripts/build_wildwood_blockout.py` from the `unreal-migration-plan` branch.
2. Copy it into your Unreal project's `Content/Python/` folder. Create that folder if needed.
3. In Unreal, use **Tools → Execute Python Script** (menu placement can vary by version) and choose `build_wildwood_blockout.py`.
4. Check the Output Log for `[Wildwood]` messages. The script creates and saves `/Game/Wildwood/Maps/LV_WildwoodVillage`.
5. Open that map from the Content Browser and press **Play**. If your Third Person template uses a different default map, set this map as the Editor Startup Map and Game Default Map in **Project Settings → Maps & Modes**.

The generated level is intentionally a blockout: floor, paths, named placeholder buildings (inn, market, workshop, cottage, town hall, bakery, stables), an orchard/forest edge, plaza props, lighting, fog, and a Player Start. It uses engine basic shapes so it needs no third-party assets.

## What comes next

- Confirm the map opens and the player can move.
- Replace placeholder buildings, trees, ground, and paths with suitable meshes/materials.
- Add a village interaction system (look-at trace + interact input + UI prompt).
- Add villager characters with animation, Nav Mesh Bounds Volume, wandering, and dialogue.
- Build the welcome/start screen and connect its button to the village map.

## Troubleshooting

- If **Execute Python Script** is missing, verify both plugins are enabled and restart the editor.
- If the map creation fails, open **Window → Output Log** and share the first red error line.
- If you see only grey shapes, that is expected at this stage; this is the layout pass before final art and gameplay.
- This script targets Unreal Editor Python APIs and has not been executed against your local engine installation in this chat. If your 5.7+ build reports an API mismatch, send the exact Output Log error and I will adjust it.

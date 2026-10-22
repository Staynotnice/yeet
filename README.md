# Wildwood — Open World Adventure

A single-player, browser-playable 2.5D open-world exploration game built with plain HTML, CSS, and JavaScript. No build step or package manager is required.

## Play locally
1. Download and unzip this folder.
2. Open `index.html` in a modern browser.
3. Explore the forest, discover the eight ancient light shards, and visit landmarks.

## Controls
- **WASD** or **arrow keys** — move
- **Shift** — sprint (uses stamina, which recovers over time)
- **E** or **Enter** — interact with nearby landmarks and shards
- On touchscreens, use the on-screen directional pad and sprint button. Tap the world to interact.

## Publish to your existing GitHub repository

These steps add the game without deleting or replacing existing files.

1. Open your repository: https://github.com/Staynotnice/yeet
2. Choose **Add file → Upload files**.
3. Upload `index.html`, `style.css`, and `game.js` from this folder to the repository's **root** (the top-level file list). Do not upload the ZIP itself as a substitute for the individual files.
4. Keep any files already in the repository. If GitHub warns that a same-named file already exists, review it first rather than blindly replacing it.
5. Add `README.md` too if you want the game instructions displayed on the repository page.
6. Commit the changes to the default branch (often `main`).
7. In the repository, open **Settings → Pages**.
8. Under **Build and deployment**, select **Deploy from a branch**.
9. Choose your default branch (usually `main`) and folder **/(root)**, then click **Save**.
10. Wait for GitHub Pages to finish deploying. Your game URL should be:
    https://Staynotnice.github.io/yeet/

If Pages is already configured for a different branch or folder, preserve that existing setup unless you intentionally want to change it. A repository-level custom domain or organization policy may affect the final URL.

## Project files
- `index.html` — game canvas and HUD
- `style.css` — responsive interface and touch controls
- `game.js` — world generation, movement, landmarks, shards, minimap, and quest logic

## Notes
- The game is a stylized 2.5D forest adventure drawn on a canvas; it does not use an external game engine.
- The interface imports Google Fonts as a visual enhancement, but the game itself does not depend on them to run.
- This package has not been pushed to your GitHub account. Upload the files yourself, or connect an authorized GitHub integration if available.

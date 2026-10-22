# Wildwood Village blockout generator for Unreal Engine 5.7+
# Run from the Unreal Editor after enabling Python Editor Script Plugin and Editor Scripting Utilities.
# This creates a simple greybox village using engine basic meshes. It does not overwrite browser-game files.

import unreal

MAP_PATH = "/Game/Wildwood/Maps/LV_WildwoodVillage"

def log(message):
    unreal.log("[Wildwood] " + message)

def spawn_mesh(mesh, name, location, scale, rotation=None):
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.StaticMeshActor,
        unreal.Vector(location[0], location[1], location[2]),
        rotation or unreal.Rotator(0.0, 0.0, 0.0)
    )
    if not actor:
        unreal.log_warning("[Wildwood] Could not spawn " + name)
        return None
    actor.set_actor_label(name)
    component = actor.get_editor_property("static_mesh_component")
    component.set_static_mesh(mesh)
    actor.set_actor_scale3d(unreal.Vector(scale[0], scale[1], scale[2]))
    return actor

def spawn_light(actor_class, name, location, rotation=None, intensity=None):
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        actor_class,
        unreal.Vector(location[0], location[1], location[2]),
        rotation or unreal.Rotator(0.0, 0.0, 0.0)
    )
    if actor:
        actor.set_actor_label(name)
        if intensity is not None:
            component = actor.get_component_by_class(unreal.LightComponent)
            if component:
                component.set_editor_property("intensity", intensity)
    return actor

def build():
    unreal.EditorAssetLibrary.make_directory("/Game/Wildwood/Maps")
    if not unreal.EditorLevelLibrary.new_level(MAP_PATH):
        log("Could not create a new level at " + MAP_PATH)
        return

    cube = unreal.EditorAssetLibrary.load_asset("/Engine/BasicShapes/Cube.Cube")
    cylinder = unreal.EditorAssetLibrary.load_asset("/Engine/BasicShapes/Cylinder.Cylinder")
    sphere = unreal.EditorAssetLibrary.load_asset("/Engine/BasicShapes/Sphere.Sphere")
    if not cube or not cylinder or not sphere:
        log("Engine basic meshes could not be loaded; check the Output Log.")
        return

    # Ground and central plaza
    spawn_mesh(cube, "Ground - temporary village floor", (0, 0, -60), (45, 45, 0.5))
    spawn_mesh(cube, "Village Green - central square", (0, 0, 5), (8, 8, 0.12))

    # Main paths radiating from the square
    spawn_mesh(cube, "North path", (0, 1500, 2), (2.2, 15, 0.08))
    spawn_mesh(cube, "South path", (0, -1500, 2), (2.2, 15, 0.08))
    spawn_mesh(cube, "East path", (1500, 0, 2), (15, 2.2, 0.08))
    spawn_mesh(cube, "West path", (-1500, 0, 2), (15, 2.2, 0.08))

    # Buildings: a readable placeholder house with base, walls, and pitched-roof approximation.
    buildings = [
        ("Inn", (-950, 550, 0), (1.7, 1.5, 1.25)),
        ("Market", (950, 550, 0), (1.6, 1.4, 1.1)),
        ("Workshop", (-950, -550, 0), (1.6, 1.5, 1.2)),
        ("Cottage", (950, -550, 0), (1.25, 1.2, 1.0)),
        ("Town Hall", (0, 1050, 0), (2.0, 1.7, 1.5)),
        ("Bakery", (0, -1050, 0), (1.35, 1.2, 1.0)),
        ("Stables", (1500, 950, 0), (1.7, 1.3, 1.0)),
    ]
    for name, (x, y, z), (sx, sy, sz) in buildings:
        spawn_mesh(cube, name + " - foundation", (x, y, z + 25), (sx * 100, sy * 100, 25))
        spawn_mesh(cube, name + " - walls", (x, y, z + 150 * sz), (sx * 100, sy * 100, 125 * sz))
        roof = spawn_mesh(cube, name + " - roof blockout", (x, y, z + 300 * sz), (sx * 110, sy * 110, 25))
        if roof:
            roof.set_actor_rotation(unreal.Rotator(0, 0, 0), False)

    # Orchard trees and forest-edge props
    tree_positions = [
        (1250, -1100), (1450, -1150), (1650, -1080), (1850, -1150),
        (-1650, 1000), (-1850, 850), (-1750, 650), (1850, 500),
        (1750, 250), (-1900, -400), (-1750, -650), (1900, -700)
    ]
    for index, (x, y) in enumerate(tree_positions):
        spawn_mesh(cylinder, "Tree trunk %02d" % index, (x, y, 115), (0.35, 0.35, 1.15))
        spawn_mesh(sphere, "Tree canopy %02d" % index, (x, y, 330), (1.5, 1.5, 1.6))

    # A few barrels, stones, and a well in the plaza
    spawn_mesh(cylinder, "Village well", (220, 170, 55), (0.75, 0.75, 0.55))
    for index, pos in enumerate([(-250, 180, 35), (280, -180, 35), (-300, -220, 35)]):
        spawn_mesh(sphere, "Plaza stone %02d" % index, pos, (0.45, 0.45, 0.35))

    # Lighting and atmosphere
    spawn_light(unreal.DirectionalLight, "Wildwood - Sun", (0, 0, 1500),
                unreal.Rotator(-35, -25, 0), 5.0)
    spawn_light(unreal.SkyLight, "Wildwood - Sky Light", (0, 0, 900), intensity=1.0)
    fog = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.ExponentialHeightFog, unreal.Vector(0, 0, 0), unreal.Rotator(0, 0, 0)
    )
    if fog:
        fog.set_actor_label("Wildwood - soft distance haze")

    # Player start roughly facing the square
    start = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.PlayerStart, unreal.Vector(0, -350, 120), unreal.Rotator(0, 0, 0)
    )
    if start:
        start.set_actor_label("Player Start - village entrance")

    unreal.EditorLevelLibrary.save_current_level()
    log("Village greybox created and saved at " + MAP_PATH)
    log("Next: press Play, check the layout, then replace greybox meshes with final art.")

build()

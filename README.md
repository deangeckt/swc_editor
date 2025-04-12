# <img src="https://github.com/user-attachments/assets/02590b93-04b6-4685-8db7-34be9a607554" alt="logo192" width="45" />  Neuron SWC editor

[![Online Editor](https://github.com/deangeckt/swc_editor/actions/workflows/pages/pages-build-deployment/badge.svg)](https://deangeckt.github.io/swc_editor/)

A free, browser-based [**online tool**](https://deangeckt.github.io/swc_editor/) for visualizing and editing morphological neuron `.swc` files — no installation required.

## Features

- View, edit, import, and export `.swc` files in both **2D** and **3D**
- Export transparent **PNG** images for figures or presentations
- Edited `.swc` files can be used in simulation tools like [**NEURON**](https://www.neuron.yale.edu/neuron/) and [**BRIAN**](https://briansimulator.org/)
- Search and load neurons directly from [NeuroMorpho.Org](https://neuromorpho.org/) using their public API

🎬 **See demo below ↓**



## Demos

#### Browse for online neurons available at [NeuroMorpho.Org](https://neuromorpho.org/)

https://github.com/user-attachments/assets/fbde380e-cc2e-4c61-91e1-3276277f3979

#### Remove a specific branch in the tree via the 2D editor, save for later analysis

https://github.com/user-attachments/assets/4985c768-71b2-4c51-9297-23d91ad5c168

#### Upload your own neuron and change segments color

https://github.com/user-attachments/assets/30049385-c528-46bb-af4b-6a7990700c2b



## MICrONS skeletons example:
To use a skeleton from [MICrONS](https://www.microns-explorer.org/cortical-mm3), which can be loaded via [skeleton_plot](https://github.com/AllenInstitute/skeleton_plot/tree/main) or [Meshparty](https://github.com/CAVEconnectome/MeshParty) run:

Loading the skeleton:
```python
import skeleton_plot.skel_io as skel_io
skel_path = "s3://bossdb-open-data/iarpa_microns/minnie/minnie65/skeletons/v661/skeletons/"
nucleus_id = 256609
segment_id = 864691135404231406
skel_filename = f"{segment_id}_{nucleus_id}.swc"
sk = skel_io.read_skeleton(skel_path, skel_filename)
```
Exporting the skeleton to SWC:
```python
import numpy as np
sk.export_to_swc(
    f'{nucleus_id}.swc',
    node_labels=sk.vertex_properties["compartment"],
    radius=np.array(sk.vertex_properties["radius"]),
    xyz_scaling=1
)
```




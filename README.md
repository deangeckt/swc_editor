# <img src="https://github.com/user-attachments/assets/02590b93-04b6-4685-8db7-34be9a607554" alt="logo192" width="50" /> Neuron SWC editor
[![Online Editor](https://github.com/deangeckt/swc_editor/actions/workflows/pages/pages-build-deployment/badge.svg)](https://deangeckt.github.io/swc_editor/)

This is a free and simple [**online editor**](https://deangeckt.github.io/swc_editor/) for morphological neuron SWC files.

It includes: visualize, edit, import and export SWC files in 2D, and export a transparent PNG image. 
The exported files can later be used in simulation software such as [Neuron](https://www.neuron.yale.edu/neuron/).

Morphological files can be found at: https://neuromorpho.org/.


### Working with skeletons:
To use a skeleton from [MICrONS](https://www.microns-explorer.org/cortical-mm3), which can be loaded via [skeleton_plot](https://github.com/AllenInstitute/skeleton_plot/tree/main) or [Meshparty](https://github.com/CAVEconnectome/MeshParty) run:

Loading the skeleton:
```python
import skeleton_plot.skel_io as skel_io
skel_path = "s3://bossdb-open-data/iarpa_microns/minnie/minnie65/skeletons/v661/skeletons/"  
nucleus_id = 189149
segment_id = 864691135855890478
skel_filename = f"{segment_id}_{nucleus_id}.swc"
sk = skel_io.read_skeleton(skel_path, skel_filename)
```
Exporting the skeleton to SWC:
```python
sk.export_to_swc(
    f'{nucleus_id}.swc',
    node_labels=sk.vertex_properties["compartment"],
    radius=np.array(sk.vertex_properties["radius"]),
    xyz_scaling=1
)
```

### Demo
In this short video I demonstrate how to upload an SWC file, navigate around using the mouse (zoom via wheel), and remove a branch from the **axon**.

https://github.com/user-attachments/assets/cc3710d6-cdd3-4cef-995e-28cf200349b9



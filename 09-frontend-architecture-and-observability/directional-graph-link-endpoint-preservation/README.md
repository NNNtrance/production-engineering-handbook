# Case Study 64: Graph Layout Association Class Link Direction Preservation

## 1. The Engineering Constraint
1. **Inverted Graphviz Visual Geometry:** In PlantUML object diagrams, declaring a directional relation with an association node (`chases -down-> dog` and `(chases, dog) . annotation`) inverted the visual layout arrow, pointing upwards instead of downwards.
2. **Double Inversion Normalization:** When creating association class nodes, the parser attempts to normalize entity order logically. Checking `isInverted()` when the link already carries directional layout metadata causes a redundant second inversion.
3. **Graph Layout Desynchronization:** Directional hints (`-down->`, `-right->`, `-up->`, `-left->`) in UML diagrams are essential for readability and architecture hierarchy; flipping arrow directions corrupts model semantics.

## 2. Why Naive Workarounds Fail
1. **Blind Entity Order Normalization:** Assuming that association classes must always bind to alphabetical or declaration entity order discards directional layout hints.
2. **Post-Processing Graphviz Hacks:** Attempting to invert arrowheads in post-processing generates disjointed edge lines and broken routing curves.
3. **Splitting Links without Endpoint Preservation:** Creating two link halves from an association point requires strictly inheriting the original link's directional vector.

## 3. The Architecture
1. **Visual Endpoint Order Preservation:** In `AbstractClassOrObjectDiagram.createNew()`, the redundant ternary inversion check (`existingLink.isInverted() ? entity2 : entity1`) was eliminated.
2. **Direct Entity Binding:** `entity1real` and `entity2real` are extracted directly via `existingLink.getEntity1()` and `existingLink.getEntity2()`, preserving the exact visual vector of the directional relation.
3. **Golden Snapshot Testing:** Validated via automated Vega/Smetana regression tests across all 4 cardinal directions (up, down, left, right).

## 4. Behavior Comparison
| Diagram Link Splitting Strategy | Cardinal Arrow Direction Accuracy | Graphviz Layout Curve Integrity | Regression Test Coverage |
|---|---|---|---|
| Inverted Ternary Normalization | Broken (Flipped Directions) | Degraded | Failed |
| Arrowhead Post-Processing Flip | Inconsistent | Broken Curve Paths | Untested |
| **Direct Endpoint Preservation** | **Preserved cardinal direction** | **Consistent layout curve paths** | **All 4 Cardinal Directions** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._

---

## 5. Implementation
See Full implementation in [`src/association_link_normalizer.java`](./src/association_link_normalizer.java).

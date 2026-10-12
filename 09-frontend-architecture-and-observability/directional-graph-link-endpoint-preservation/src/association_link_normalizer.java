// plantuml/plantuml PR #2843 by @onuracar-dev
// Fixes inverted directional association links in object diagrams

void createNew(LineLocation location, int mode, LinkType linkType, Display label) {
    // ...
    else
        removeLink(existingLink);

    // BUG: existingLink.isInverted() normalized the link back to logical entity order.
    // When splitting a directional link (-down->, -up->) at an association node,
    // this inverted the visual arrow geometry a second time, flipping the layout!
    
    // FIX: Preserve the stored visual endpoint order directly:
    final Entity entity1real = existingLink.getEntity1();
    final Entity entity2real = existingLink.getEntity2();

    entity1ToPoint = new Link(location, AbstractClassOrObjectDiagram.this,
            getSkinParam().getCurrentStyleBuilder(), entity1real, point, 
            existingLink.getType().getPart2(), label, existingLink.getLength());
}
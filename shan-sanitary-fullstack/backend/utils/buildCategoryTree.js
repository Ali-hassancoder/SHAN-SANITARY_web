// Converts a flat array of category documents (each with a `parent` field)
// into a nested tree structure — used for nav menus (Section 12).
export const buildCategoryTree = (categories) => {
  const map = {};
  const roots = [];

  categories.forEach((cat) => {
    map[cat._id.toString()] = { ...cat.toObject(), children: [] };
  });

  categories.forEach((cat) => {
    const node = map[cat._id.toString()];
    if (cat.parent) {
      const parentNode = map[cat.parent.toString()];
      if (parentNode) parentNode.children.push(node);
      // If parentNode doesn't exist (e.g. parent was deactivated and excluded
      // from this query), we silently skip attaching it rather than crashing —
      // an orphaned category branch just won't render, which is safer than an error.
    } else {
      roots.push(node);
    }
  });

  return roots;
};
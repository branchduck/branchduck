import { filter } from "domutils";
import { isTag, type AnyNode, type Element } from "domhandler";

export function getHeadingStructure(nodes: AnyNode[]) {
    const headingNames = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const headings = filter(
        (element) => isTag(element) && headingNames.includes(element.name),
        nodes,
    ) as Element[];

    const headingStructure = headings.map((heading) => {
        return {
            level: Number(heading.name[1]),
            text: (heading.children[0] as unknown as Text).data,
            prev: heading.prev
                ? {
                      level: Number((heading.prev as Element).name[1]),
                      text: (
                          (heading.prev as Element)
                              .children[0] as unknown as Text
                      ).data,
                  }
                : null,
        };
    });

    return headingStructure;
}

export function convertToTree(flatArray) {
    const result = [];

    flatArray.forEach((item) => {
        const currentNode = {
            level: item.level,
            text: item.text,
            children: [],
        };

        if (!item.prev) {
            // Root level item
            result.push(currentNode);
            return;
        }

        // Find the previous node in our tree structure
        const findNodeByPrev = (nodes, prevItem) => {
            for (let node of nodes) {
                if (
                    node.level === prevItem.level &&
                    node.text === prevItem.text
                ) {
                    return node;
                }

                const found = findNodeByPrev(node.children, prevItem);

                if (found) {
                    return found;
                }
            }

            return null;
        };

        const prevNode = findNodeByPrev(result, item.prev);

        if (!prevNode) {
            // If prev node not found, add to root
            result.push(currentNode);
            return;
        }

        if (item.level > item.prev.level) {
            // Direct child of previous node
            prevNode.children.push(currentNode);
        } else {
            // Same level or going back up - need to find the appropriate parent
            let parent = null;

            // Traverse the tree to find the last node at the level above current
            const findParent = (nodes) => {
                for (let i = nodes.length - 1; i >= 0; i--) {
                    const node = nodes[i];

                    if (node.level === item.level - 1) {
                        parent = node;
                        return true;
                    }

                    if (node.children.length) {
                        if (findParent(node.children)) {
                            return true;
                        }
                    }
                }

                return false;
            };

            findParent(result);

            if (parent) {
                parent.children.push(currentNode);
            } else {
                // If no appropriate parent found, add to root level
                result.push(currentNode);
            }
        }
    });

    return result;
}

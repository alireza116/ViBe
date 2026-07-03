// @ts-check

export class SceneGraph {
    constructor() {
        /** @type {import('../types').FeatureNode[]} */
        this.children = [];
    }

    /**
     * @param {import('../types').FeatureNode} node
     */
    add(node) {
        this.children.push(node);
    }

    clear() {
        this.children = [];
    }
}


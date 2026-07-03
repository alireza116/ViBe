export class SceneGraph {
    constructor() {
        this.children = [];
    }

    add(node) {
        this.children.push(node);
    }

    clear() {
        this.children = [];
    }
}

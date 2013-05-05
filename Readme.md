
# Accordion Tree

  A no-frills "Tree View" component.

  Love it or hate it, it's here to stay... 
  
  <img alt="Example" src="" />

  See `test/index.html` for example usage.
  
## Installation

    $ component install ericgj/accordion-tree

## Events

  - `selectLeaf(node)`      when a leaf node is selected
  - `selectBranch(node)`    when a branch node is selected 
  - `select(node, type)`    when any node is selected (type is 'leaf' or 'branch')

## API
  
### AccordionTree(el, options)

  Creates a new `AccordionTree` under the given DOM element or selector.
  See info on the generated structure below.

  The following options are available:

  - `deselect {Boolean}`    allows collapse of selected node (default true)
  - `multiselect {Boolean}` allows expansion of more than one panel per tree 
                            level (default false)

### AccordionTree#addBranch(content,slug)

  Add a branch node with the given content, and (optional) identifying slug.
  Returns the new node.

### AccordionTree#addLeaf(content,slug)

  Add a leaf node with the given content, and (optional) identifying slug.
  Returns the new node.


### Node#addBranch(content,slug)

  Add a branch node with this node as the root.

### Node#addLeaf(content,slug)

  Add a leaf node with this node as the root.

### Node#select

  Programmatically expand this node (following deselect/multiselect behavior).

### Node#deselect

  Programmatically collapse this node.

### Node#deselectAll

  Programmatically collapse this node and all its siblings.



## DOM structure

  In the DOM, the generated tree looks like this:

  ```html
  <div class="accordion-tree">
    <ul class="children">
      <li class="branch" data-path="/a-branch">
        <h3>
          <span class="caret"></span>
          A branch
        </h3>
        <ul class="children">
          <li class="leaf" data-path="/a-branch/a-leaf">
            A leaf
          </li>
          <li class="leaf" data-path="/a-branch/another-leaf">
            Another leaf
          </li>
        </ul>
      </li>
      <li class="branch" data-path="/another-branch">
        <h3>
          <span class="caret"></span>
          Another branch
        </h3>
        <ul class="children">
        </ul>
      </li>
    </ul>
  </div>
  ```

  Note that the top-level DOM element will have the "accordion-tree" class
  added on initialization.

## Help

Questions, suggestions, pull requests, etc. please contact me.

## License

  MIT




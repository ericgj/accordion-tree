var delegates = require('delegates')
  , domify    = require('domify')
  , classes   = require('classes')
  , noop      = function(){}

module.exports = AccordionTree;

defaults = {
  deselect:    true,
  multiselect: false
};

function AccordionTree(el,options){
  if (!(this instanceof AccordionTree)) return new AccordionTree(el,options);
  this.el = el;
  this.root = new Node(this);
  this.nodes = [];

  options = merge(defaults, options || {})
  this.selectBehavior   = (options.multiselect ? noop : this.deselectAll);
  this.reselectBehavior = (options.deselect ? this.deselect : noop);

  this.events = delegates(this.el, this);
  this.events.on('click .leaf', this.onClickLeaf.bind(this));
  this.events.on('click .branch', this.onClickBranch.bind(this));

  return this;
}

AccordionTree.prototype = new Emitter;

AccordionTree.prototype.addLeaf = function(content,slug){
  var leaf = this.root.addLeaf(content,slug);
  this.nodes[leaf.slug] = leaf;
  return leaf;
}

AccordionTree.prototype.addBranch = function(content,slug){
  var branch = this.root.addBranch(content,slug);
  this.nodes[branch.slug] = branch;
  return branch;
}

AccordionTree.prototype.deselectAll = function(){
  this.root.deselectAll();
}

AccordionTree.prototype.deselect = function(slug){
  var node = this.nodes[slug];
  node && node.deselect();
}

AccordionTree.prototype.onClickLeaf = function(e){
  var slug = e.target.getAttribute('data-slug'),
      leaf = this.nodes[slug];
  if (leaf) this.emit('selectLeaf', leaf);
}

AccordionTree.prototype.onClickBranch = function(e){
  var slug = e.target.getAttribute('data-slug'),
      branch = this.nodes[slug];
  branch.select();
  if (branch) this.emit('selectBranch', branch);
}



function Node(container,root,content,slug){

  this.container = container;
  this.root = root;
  this.content = content;
  this.baseSlug = slugify(slug || content);
  this.slug = slugify(this.fullPath());
  this.selected = false;
  this.children = [];
  return this;
}

Node.prototype.fullPath = function(){
  if (!this.root) return this.baseSlug;
  return [this.root.fullPath(), this.baseSlug].join('/');
}
  
// TODO
Node.prototype.addLeaf = function(content,slug){
}

// TODO
Node.prototype.addBranch = function(content,slug){
}


Node.prototype.select = function(){
  if (this.selected){
    this.container.reselectBehavior();
  } else {
    this.container.selectBehavior();
    classes(this.el).add('selected');
    this.selected = true;
  }
}

Node.prototype.deselect = function(){
  classes(this.el).remove('selected');
  this.selected = false;
}


Node.prototype.deselectAll = function(){
  for (var node in this.children) node.deselect();
}

// private


// TODO
var slugify = function(str){
  return str;
}

var has = Object.prototype.hasOwnProperty;

var mergeInto = function(a,b){
  for (var key in b) {
    if (has.call(b,key)){
      a[key] = b[key];
    }
  }
  return a;
}

// non-mutating merge
var merge = function(a,b){
  var m = mergeInto({},a);
  return mergeInto(m,b);
}


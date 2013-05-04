var delegates = require('delegates')
  , domify    = require('domify')
  , classes   = require('classes')
  , leafTmpl  = require('./leaf.js')
  , branchTmpl= require('./branch.js')
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
  this.nodes[leaf.path] = leaf;
  return leaf;
}

AccordionTree.prototype.addBranch = function(content,slug){
  var branch = this.root.addBranch(content,slug);
  this.nodes[branch.path] = branch;
  return branch;
}

AccordionTree.prototype.selectAll = function(recurse){
  this.root.selectAll(recurse);
}

AccordionTree.prototype.deselectAll = function(recurse){
  this.root.deselectAll(recurse);
}

AccordionTree.prototype.deselect = function(path){
  var node = this.nodes[path];
  node && node.deselect();
}

AccordionTree.prototype.onClickLeaf = function(e){
  var path = e.target.getAttribute('data-path'),
      leaf = this.nodes[path];
  if (leaf) this.emit('selectLeaf', leaf);
}

AccordionTree.prototype.onClickBranch = function(e){
  var path = e.target.getAttribute('data-path'),
      branch = this.nodes[path];
  branch.select();
  if (branch) this.emit('selectBranch', branch);
}



function Node(container,root,content,slug){

  this.container = container;
  this.root = root;
  this.content = content;
  this.slug = slugify(slug || content);
  this.path = this.fullPath();
  
  this.el = null;
  this.selected = false;
  this.children = [];
  return this;
}

Node.prototype.fullPath = function(){
  if (!this.root) return this.slug;
  return [this.root.fullPath(), this.slug].join('/');
}
  
Node.prototype.addLeaf = function(content,slug){
  return this.addNode(leafTmpl,content,slug);
}

Node.prototype.addBranch = function(content,slug){
  return this.addNode(branchTmpl,content,slug);
}

Node.prototype.addNode = function(tmpl,content,slug){
  var node = new Node(this.container, this, content, slug);
  node.el = domify(tmpl(node))[0];
  var parentEl = this.el.querySelector('.children');
  if (parentEl) parentEl.appendChild(node.el);
  this.children.push(node);
  return node;
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

Node.prototype.selectAll = function(recurse){
  for (var node in this.children) {
    if (recurse) node.selectAll(recurse);
    node.select();
  }
}

Node.prototype.deselect = function(){
  classes(this.el).remove('selected');
  this.selected = false;
}


Node.prototype.deselectAll = function(recurse){
  for (var node in this.children) {
    if (recurse) node.deselectAll(recurse);
    node.deselect();
  }
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


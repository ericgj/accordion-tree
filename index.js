var delegates = require('delegates')
  , Emitter   = require('emitter')
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
  if (typeof el=='string') el = document.querySelector(el);
  this.el = el;
  this.root = new Node(this);
  this.nodes = [];

  options = merge(defaults, options || {})
  this.selectBehavior   = (options.multiselect ? null : 'deselectAll');
  this.reselectBehavior = (options.deselect ? 'deselect' : null);

  this.events = delegates(this.el, this);
  this.events.bind('click .leaf'  ,           'onClickLeaf');
  this.events.bind('click .branch > .caret' , 'onClickCaret');
  this.events.bind('click .branch',           'onClickBranch');
  
  classes(this.el).add('accordion-tree');
  this.el.appendChild(domify('<ul class="children"></ul>')[0]);

  return this;
}

AccordionTree.prototype = new Emitter;

AccordionTree.prototype.addLeaf = function(content,slug){
  return this.root.addLeaf(content,slug);
}

AccordionTree.prototype.addBranch = function(content,slug){
  return this.root.addBranch(content,slug);
}

AccordionTree.prototype.deselect = function(node){
  node.deselect();
}

AccordionTree.prototype.onClickLeaf = function(e){
  var path = e.target.getAttribute('data-path')
    , leaf = this.nodes[path];
  if (leaf) {
    this.emit('selectLeaf', leaf);
    this.emit('select', leaf, 'leaf');
  }
}

AccordionTree.prototype.onClickBranch = function(e){
  var path = e.target.getAttribute('data-path')
    , branch = this.nodes[path];
  if (branch) {
    this.emit('selectBranch', branch);
    this.emit('select', branch, 'branch');
  }
}

AccordionTree.prototype.onClickCaret = function(e){
  var path = e.target.parentNode.getAttribute('data-path')
    , branch = this.nodes[path];
  branch.select();
}


function Node(container,root,content,slug){

  this.container = container;
  this.root = root;
  this.content = content;
  this.slug = slugify(slug || content);
  this.path = this.fullPath();
  
  this.el = (root ? root.el : container.el);
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
  this.container.nodes[node.path] = node;
  this.children.push(node);
  var parentEl = this.el.querySelector('.children');
  if (parentEl) parentEl.appendChild(node.el);
  return node;
}

Node.prototype.select = function(){
  if (this.selected){
    var meth = this.container.reselectBehavior;
    if (meth) this[meth]();
  } else {
    var meth = this.container.selectBehavior;
    if (meth) this[meth]();
    classes(this.el).add('selected');
    this.selected = true;
  }
}

Node.prototype.deselect = function(){
  classes(this.el).remove('selected');
  this.selected = false;
}

Node.prototype.deselectAll = function(){
  var nodes = this.siblingNodes();
  for (i=0;i<nodes.length;++i){
    nodes[i].deselect();
  }
}

Node.prototype.siblingNodes = function(){
  if (!this.root) return [];
  return this.root.children;
}

// private


var slugify = function(str){
  str = str || '';
  return String(str)
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[^a-z0-9-]/g, '');
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


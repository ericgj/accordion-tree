var delegates = require('delegates')
  , Emitter   = require('emitter')
  , domify    = require('domify')
  , classes   = require('classes')
  , indexof   = require('indexof')
  , leafTmpl  = require('./leaf.js')
  , branchTmpl= require('./branch.js')
  , build     = require('./builder.js')

module.exports = AccordionTree;

defaults = {
  collapse:    true,
  multiexpand: false,
  branchexpand: true
};

function AccordionTree(el,options){
  if (!(this instanceof AccordionTree)) return new AccordionTree(el,options);
  if (typeof el=='string') el = document.querySelector(el);
  this.el = el;
  this.nodes = {};
  this.root = new Node(this);
  this.nodes[this.root.path] = this.root;

  options = merge(defaults, options || {})
  this.selectBehavior   = (options.multiexpand ? null : 'collapseAll');
  this.reselectBehavior = (options.collapse ? 'collapse' : null);
  this.branchExpand     = options.branchexpand;

  this.events = delegates(this.el, this);
  this.events.bind('click .leaf'  ,               'onClickLeaf');
  this.events.bind('click .branch > * > .caret' , 'onClickCaret');
  this.events.bind('click .branch > * > .icon' ,  'onClickCaret');
  this.events.bind('click .branch > *',           'onClickBranch');
  
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

AccordionTree.prototype.expand   = function(node){
  node.expand();
}

AccordionTree.prototype.collapse = function(node){
  node.collapse();
}

AccordionTree.prototype.build = function(obj,root){
  build(root || this.root, obj);
}

AccordionTree.prototype.removeNode = function(root){
  root && root.remove();
}

AccordionTree.prototype.clear =
AccordionTree.prototype.remove = function(){
  this.removeNode(this.root);
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
  var path = e.target.parentNode.getAttribute('data-path')
    , branch = this.nodes[path];
  if (branch) {
    if (this.branchExpand) branch.expand();
    this.emit('selectBranch', branch);
    this.emit('select', branch, 'branch');
  }
}

AccordionTree.prototype.onClickCaret = function(e){
  var path = e.target.parentNode.parentNode.getAttribute('data-path')
    , branch = this.nodes[path];
  branch.expand();
}


function Node(container,root,content,slug){

  this.container = container;
  this.root = root;
  this.content = content;
  this.slug = slugify(slug || content);
  this.path = this.fullPath();
  
  this.el = (root ? root.el : container.el);
  this.expanded = false;
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

// PITA!  
/* Note that arrays are left with holes, should consider using a
   set or list data structure instead
*/
Node.prototype.remove = function(){
  for (var i=0;i<this.children.length;++i){
    var child = this.children[i];
    if (child) child.remove();
  }
  this.children = [];
  if (this.root){
    var parentEl = this.root.el.querySelector('.children');
    if (parentEl) parentEl.removeChild(this.el);
    delete this.root.children[indexof(this.root.children,this)];
    delete this.container.nodes[this.path];
  }
}

Node.prototype.expand = function(){
  if (this.expanded){
    var meth = this.container.reselectBehavior;
    if (meth) this[meth]();
  } else {
    var meth = this.container.selectBehavior;
    if (meth) this[meth]();
    classes(this.el).add('expanded');
    this.expanded = true;
  }
}

Node.prototype.collapse = function(){
  classes(this.el).remove('expanded');
  this.expanded = false;
}

Node.prototype.collapseAll = function(){
  var nodes = this.siblingNodes();
  for (i=0;i<nodes.length;++i){
    nodes[i] && nodes[i].collapse();
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


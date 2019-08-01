// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
// require jquery_ujs
// require jquery_ujs
// require turbolinks
//= require angularjs/angular
//= require angular-sanitize/angular-sanitize
//= require angular-resource/angular-resource
//= require angular-route/angular-route
//= require angular-animate/angular-animate
//= require angular-bootstrap/ui-bootstrap
//= require angular-bootstrap/ui-bootstrap-tpls
//= require angular-ui-select/dist/select
//= require_tree .

//= require jquery/dist/jquery
jQuery.fn.load = function(callback){ $(window).on("load", callback) };
//= require foundation
$(function(){ $(document).foundation(); });

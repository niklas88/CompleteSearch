import $ from 'jquery';
import _ from 'underscore';
import Noty from 'noty';

window.$ = window.jQuery = $;
window._ = _;

Noty.overrideDefaults({
    layout: 'topRight',
    theme: 'relax',
    timeout: 3000,
    type: 'information'
});

require('arrive');
require('bootstrap');
require('bootstrap-material-design');
require('./libs/material-kit');
require('./libs/jquery.deparam');
require('./app/initialize');

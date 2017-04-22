import Noty from 'noty';

Noty.overrideDefaults({
    layout: 'topRight',
    theme: 'relax',
    timeout: 3000,
    type: 'information'
});

require('arrive');
require('bootstrap/dist/js/bootstrap.min');
require('bootstrap-material-design');
require('./libs/material-kit');
require('./libs/jquery.dropdown');
require('./libs/jquery.deparam');
require('./app/initialize');

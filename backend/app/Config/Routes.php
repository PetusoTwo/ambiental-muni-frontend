<?php

$routes->group('denunciaambiental', ['namespace' => 'App\Controllers\denuncias_ambiental\AmbientalDenounce\v1'], static function ($routes) {
    $routes->options('(:any)', static function () {
        return;
    });
    //GET ROUTES
    $routes->get('findPublicInformationByDenounceId', 'FormController::findPublicInformationByDenounceId');
    $routes->get('findDenounceTracking', 'FormController::findDenounceTracking');
    $routes->get('requestProof', 'FormController::requestProof');
    $routes->get('requestPDF', 'FormController::requestPDF');
    $routes->get('findDetailDenounce', 'FormController::findDetailDenounce');
    $routes->get('findDenouncesByOffset', 'FormController::findDenouncesByOffset');
    $routes->get('logout', 'AuthController::logout');

    //POST ROUTES
    $routes->post('login', 'AuthController::login');
    $routes->post('validateSession', 'AuthController::validateSession');
    $routes->post('saveForm', 'FormController::saveForm');

    //PUT ROUTES
    $routes->put('updateDenounceState', 'FormController::updateDenounceState');

    //DELETE ROUTES
    $routes->delete('deleteDenounceState', 'FormController::deleteDenounceState');

});

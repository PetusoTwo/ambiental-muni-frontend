<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */
class Cors extends BaseConfig
{
    /**
     * The default CORS configuration.
     *
     * @var array{
     *      allowedOrigins: list<string>,
     *      allowedOriginsPatterns: list<string>,
     *      supportsCredentials: bool,
     *      allowedHeaders: list<string>,
     *      exposedHeaders: list<string>,
     *      allowedMethods: list<string>,
     *      maxAge: int,
     *  }
     */
    public array $default = [
        'allowedOrigins' => [
            'http://localhost:4200',
            'http://localhost:4201',
            'http://192.168.0.16:4200',
        ], // Especifica los orígenes permitidos
        'allowedHeaders' => ['Content-Type', 'Authorization', 'X-Requested-With'], // Encabezados permitidos
        'allowedMethods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
        'supportsCredentials' => true, // Permite credenciales (cookies, headers de autorización, etc.)
        'exposedHeaders' => ['Content-Type', 'Authorization'], // Encabezados expuestos
        'maxAge' => 7200, // Tiempo de caché para preflight
    ];
}

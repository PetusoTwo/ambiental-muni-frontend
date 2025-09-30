<?php

namespace App\Controllers\denuncias_ambiental\AmbientalDenounce\v1;

use App\Libraries\AmbientalDenounce\Response;
use App\Models\denuncias_ambiental\AmbientalDenounce\User;
use CodeIgniter\RESTful\ResourceController;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;


class AuthController extends ResourceController
{
    public function __construct()
    {
        helper('cookie');
    }
    public function login()
{
    $model = new User();

    // Intenta leer JSON primero
    $formData = $this->request->getJSON(true);

    // Si no llega JSON, prueba con POST normal
    if (!$formData) {
        $formData = $this->request->getPost();
    }

    $email = $formData["email"] ?? null;
    $password = $formData["password"] ?? null;

    log_message('debug', "LOGIN DEBUG - Email recibido: {$email}, Password recibido: {$password}");

    try {
        $data = $model->verifyUser($email, $password);

        if ($data == null) {
            $response = new Response(false, "Credenciales ingresadas son invalidas");
            return $this->respond($response, 500);
        }

        $payload = [
            "email" => $email,
            'id'    => (int) $data['id'],
            'name'  => $data['name']
        ];

        $this->createJWTSessionToken($payload);

        return $this->respond($payload, 200);

    } catch (Exception $e) {
        $response = new Response(false, "Error: " . $e->getMessage());
        return $this->respond($response, 400);
    }
}


    public function logout()
    {
        set_cookie("token", "", time() - 3600, "", "/", httpOnly: true, secure: false);
        return $this->respond([], 200);
    }


    // public function validateSession()
    // {

    //     if (isset($_COOKIE['token'])) {

    //         try {

    //             $token = JWT::decode($_COOKIE['token'], new Key($_ENV["AMBIENTAL_DENOUNCE_KEY_JWT"], 'HS256'));

    //             $data = [
    //                 'approval' => true,
    //                 'userInformation' => [
    //                     'email' => $token->email,
    //                     'id' => $token->id,
    //                     'name' => $token->name
    //                 ]
    //             ];

    //             return $this->respond($data, 200);

    //         } catch (Exception $e) {

    //             return $this->respond(['approval' => false], 500);

    //         }

    //     } else {

    //         return $this->respond(['approval' => false], 200);
    //     }

    // }

    public function validateSession()
    {
        try {
            if (!isset($_COOKIE['token'])) {
                return $this->respond([
                    'success' => false,
                    'message' => 'No token cookie found'
                ], 200);
            }

            if (empty($_COOKIE['token'])) {
                return $this->respond([
                    'success' => false,
                    'message' => 'Token cookie is empty'
                ], 200);
            }

            $token = JWT::decode(
                $_COOKIE['token'],
                new Key($_ENV["AMBIENTAL_DENOUNCE_KEY_JWT"], 'HS256')
            );

            return $this->respond([
                'success' => true,
                'approval' => true,
                'userInformation' => [
                    'email' => $token->email ?? null,
                    'id'    => $token->id ?? null,
                    'name'  => $token->name ?? null
                ]
            ], 200);

        } catch (Exception $e) {
            return $this->respond([
                'success' => false,
                'approval' => false,
                'message' => $e->getMessage()
            ], 200);
        }
    }

    private function createJWTSessionToken(array $payload)
    {

        $secret_key = $_ENV["AMBIENTAL_DENOUNCE_KEY_JWT"];

        $jwt_token = JWT::encode($payload, $secret_key, 'HS256');

        // Mejor manera en CI4
        set_cookie([
            'name'     => 'token',
            'value'    => $jwt_token,
            'expire'   => 60 * 180,
            'httponly' => true,
            'secure'   => false,
            'path'     => '/',
        ]);
    }

    
}

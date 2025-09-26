<?php

namespace App\Controllers\AmbientalDenounce\v1;

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
        $formData = $this->request->getJSON(assoc: true);
        $email =  $formData["email"];
        $password =  $formData["password"];

        try {

            $data = $model->verifyUser($email, $password);

            if ($data == null) {
                $response = new Response(false, "Credenciales ingresadas son invalidas");
                return $this->respond($response, 500);
            }

            $payload = array(
                "email" => $email,
                "password" => $password,
                'id' => (int) $data['id'],
                'name' => $data['name']
            );

            $this->createJWTSessionToken($payload);

            return $this->respond($payload, 200);

        } catch (Exception $e) {

            $response = new Response(false, "Credenciales ingresadas son invalidas");
            return $this->respond($response, 400);

        }

    }

    public function logout()
    {
        set_cookie("token", "", time() - 3600, "", "/", httpOnly: true, secure: false);
        return $this->respond([], 200);
    }


    public function validateSession()
    {

        if (isset($_COOKIE['token'])) {

            try {

                $token = JWT::decode($_COOKIE['token'], new Key($_ENV["AMBIENTAL_DENOUNCE_KEY_JWT"], 'HS256'));

                $data = [
                    'approval' => true,
                    'userInformation' => [
                        'email' => $token->email,
                        'id' => $token->id,
                        'name' => $token->name
                    ]
                ];

                return $this->respond($data, 200);

            } catch (Exception $e) {

                return $this->respond(['approval' => false], 500);

            }

        } else {

            return $this->respond(['approval' => false], 200);
        }

    }

    private function createJWTSessionToken(array $payload)
    {

        $secret_key = $_ENV["AMBIENTAL_DENOUNCE_KEY_JWT"];

        $jwt_token = JWT::encode($payload, $secret_key, 'HS256');

        set_cookie("token", $jwt_token, time() + (60 * 180), '', "/", httpOnly: true, secure: false);
    }
}

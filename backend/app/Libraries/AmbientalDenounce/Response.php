<?php

namespace App\Libraries\AmbientalDenounce;

use JsonSerializable;

class Response implements JsonSerializable
{
    private bool $success;
    private string $message;

    public function __construct(bool $success, string $message)
    {
        $this->success = $success;
        $this->message = $message;
    }

    public function jsonSerialize(): array
    {
        return [
            'success' => $this->success,
            'message' => $this->message
        ];
    }
}
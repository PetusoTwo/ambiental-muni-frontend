<?php

namespace App\Libraries\AmbientalDenounce;

class FileFormatValidator
{

    private string $format;
    private string $path;

    public function __construct(string $format, string $path)
    {
        $this->format = $format;
        $this->path = $path;
    }

    public function isValid(): bool
    {

        switch ($this->format) {
            case 'png':
                return exif_imagetype($this->path) == IMAGETYPE_PNG;
            case 'jpeg':
                return exif_imagetype($this->path) == IMAGETYPE_JPEG;
            case 'pdf':
                return $this->verifyPDF();
            case 'mp4':
                return $this->verifyMP4();
            default:
                return false;
        }
    }

    private function verifyPDF(): bool
    {

        $fp = fopen($this->path, "rb");
        $sign = fread($fp, 4);
        fclose($fp);

        return substr($sign, 0, strlen('%PDF')) === '%PDF';
    }

    private function verifyMP4(): bool
    {

        $fp = fopen($this->path, "rb");
        $sign = fread($fp, 12);
        fclose($fp);

        return substr($sign, 4, strlen('ftypmmp4')) === 'ftypmmp4';
    }

    public function getPath(): string
    {
        return $this->path;
    }
}
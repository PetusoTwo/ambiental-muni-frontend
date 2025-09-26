<?php

namespace App\Libraries\AmbientalDenounce;

use Exception;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class EmailProvider
{
    private $mail;


    public function __construct()
    {
        $this->mail = new PHPMailer(true);
    }

    public function sendEmail($recipientEmail, $user, $idDenounce, $ambientalPromiseSubject)
    {
        try {

            $this->mail->SMTPDebug = SMTP::DEBUG_OFF;
            $this->mail->isSMTP();
            $this->mail->Host       = $_ENV["AMBIENTAL_DENOUNCE_EMAIL_HOST"];
            $this->mail->SMTPAuth   = true;
            $this->mail->Username   = $_ENV["AMBIENTAL_DENOUNCE_EMAIL_USERNAME"];
            $this->mail->Password   = $_ENV['AMBIENTAL_DENOUNCE_EMAIL_PASSWORD'];
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mail->Port       = 587;

            $publicDir = getcwd();

            $this->mail->setFrom($_ENV["AMBIENTAL_DENOUNCE_EMAIL_USERNAME"], 'munijlo');
            $this->mail->addAddress($recipientEmail);

            $this->mail->addEmbeddedImage($publicDir . '/resources/logotipo.jpeg', 'logo_cid');

            $html = file_get_contents($publicDir . "/resources/email-template.html");

            $htmlContent = str_replace('src="logotipo.jpeg"', 'src="cid:logo_cid"', $html);
            $htmlContent = str_replace("{user_name}", $user, $htmlContent);
            $htmlContent = str_replace("{link}", $_ENV['AMBIENTAL_DENOUNCE_EMAIL_DENOUNCE_QUERY_LINK'], $htmlContent);
            $htmlContent = str_replace("{id_denounce}", $idDenounce, $htmlContent);

            $ambientalPromiseSubject = mb_strtolower($ambientalPromiseSubject);

            $this->mail->isHTML(true);
            $this->mail->Subject = "Denuncia ambiental virtual sobre el factor comprometido ({$ambientalPromiseSubject})";
            $this->mail->Body    = $htmlContent;


            $this->mail->send();
        } catch (Exception $e) {
            $this->mail->ErrorInfo;
            throw new Exception("Ha ocurrido un error al enviar el email: " . $e->getMessage());
        }
    }
}

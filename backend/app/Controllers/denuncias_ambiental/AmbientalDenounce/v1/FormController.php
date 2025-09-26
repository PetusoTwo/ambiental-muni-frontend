<?php

namespace App\Controllers\AmbientalDenounce\v1;

use App\Libraries\AmbientalDenounce\EmailProvider;
use App\Libraries\AmbientalDenounce\ExportPDF;
use App\Libraries\AmbientalDenounce\FileFormatValidator;
use App\Libraries\AmbientalDenounce\Response;
use App\Models\denuncias_ambiental\AmbientalDenounce\Denounce;
use App\Models\denuncias_ambiental\AmbientalDenounce\DenounceAction;
use CodeIgniter\Database\Exceptions\DatabaseException;
use CodeIgniter\RESTful\ResourceController;
use Exception;
use SebastianBergmann\LinesOfCode\IllogicalValuesException;

class FormController extends ResourceController
{

    public function requestPDF() {

        $model = new Denounce();

        $id = $this->request->getGet('id');

        if (!$id) throw new IllogicalValuesException('No especifico id', 500);

        $pdfData = $model->findDenounceForPDFById($id);

        $export = new ExportPDF($pdfData);

        $export->create();

        $this->response->setContentType('application/pdf');
        
    }

    public function saveForm() {

        $formData = $this->request->getJSON(assoc: true);

        $files = $formData['proof']['proofData'];

        $projectDir = dirname(getcwd());

        $storagePath = $projectDir . '/storage';

        if (!empty($files)) {

            $tempFiles = array();

            foreach ($files as $file) {

                $fileBuffer = base64_decode($file['data']);
                $path = $storagePath . $file['proofPath'];
                file_put_contents($path, $fileBuffer);

                $formatValidator = new FileFormatValidator($file['proofType'], $path);

                array_push($tempFiles, $formatValidator);

                if (!$formatValidator->isValid()) {

                    foreach ($tempFiles as $tempFile) {

                        unlink($tempFile->getPath());
                    }

                    $response = new Response(false, "Formato invalido en archivo " . $file['name']);

                    return $this->respond($response, 500);
                }
            }
        }

        helper('form_helper');

        try {

            $db = \Config\Database::connect();
            $db->transException(true)->transStart();

            $generalAspects = $formData['generalAspects'];
            $previousDenounce = $formData['previousDenounce'];
            $ambientalPromises = $formData['ambientalPromises'];
            $proof = $formData['proof'];
        
            $denounceTbl = $db->table('denounce');
            $personTbl = $db->table('person');
            $personDenounceTbl = $db->table('person_denounce');
            $denounceAmbientalCauseTbl = $db->table('denounce_ambiental_cause');
            $denounceActionTbl = $db->table('denounce_action');
            $proofTbl = $db->table('proof');

            $denounceData = getDenounceData($generalAspects, $previousDenounce, $ambientalPromises, $proof);
            $denouncerData = getPersonData($formData['denouncer']);
            $denouncedData = getPersonData($formData['denounced']);

            $denounceTbl->insert($denounceData);
            $idDenounce = $db->insertID();
            
            $personTbl->insert($denouncerData);
            $idDenouncer = $db->insertID();
            
            $personTbl->insert($denouncedData);
            $idDenounced = $db->insertID();

            $personDenouncerData = getPersonDenounceData($idDenounce, $idDenouncer, true);
            $personDenouncedData = getPersonDenounceData($idDenounce, $idDenounced, false);

            $personDenounceTbl->insert($personDenouncerData);
            $personDenounceTbl->insert($personDenouncedData);
            $denounceActionTbl->insert([
                "id_denounce" => $idDenounce,
                "id_denounce_status" => 1,
                "description" => "Se registro la denuncia"
            ]);

            foreach ($ambientalPromises['causes'] as $cause) {

                $promise = [
                    "id_ambiental_cause" => $cause,
                    "id_denounce" => $idDenounce
                ];

                $denounceAmbientalCauseTbl->insert($promise);
            }

            $files = $proof['proofData'];

            if (!empty($files)) {

                foreach ($files as $file) {

                    $proofData = [
                        "id_denounce" => $idDenounce,
                        "path" => $file['proofPath']
                    ];

                    $proofTbl->insert($proofData);
                }
            }

            $email = new EmailProvider();

            $emailName = $denouncerData['is_natural_person'] ? $denouncerData['name'] : $denouncerData['trade_name'];

            $email->sendEmail($denouncerData['email'], $emailName, $idDenounce, $denounceData['ambiental_promise']);

            $db->transComplete();

        } catch (Exception $e) {

            return $this->respond(new Response(false, "Ha ocurrido un error en el servidor, intente de nuevo en unos momentos"), 500);

        }

        return $this->respond(new Response(true, "Denuncia enviada satisfactoriamente"), 200);

    }

    public function findDenouncesByOffset() {

        $model = new Denounce();

        $offset = $this->request->getGet('offset');
        $denouncerDocNumber = $this->request->getGet('denouncerDocNumber');
        $denouncedDocNumber = $this->request->getGet('denouncedDocNumber');
        $date = $this->request->getGet('date');
        $denounceType = $this->request->getGet('denounceType');

        $offset = $offset ? $offset : 0;
        $denouncerDocNumber = $denouncerDocNumber ? (int) $denouncerDocNumber : NULL;
        $denouncedDocNumber = $denouncedDocNumber ? (int) $denouncedDocNumber : NULL;
        $date = $date ? $date : NULL;
        $denounceType = $denounceType ? $denounceType : NULL;

        $data = $model->findDenouncesByOffset($denouncerDocNumber, $denouncedDocNumber, $date, $denounceType, $offset);

        return $this->respond($data, 200);

    }

    public function findDetailDenounce() {

        $model = new Denounce();

        $id = $this->request->getGet('id');

        if (!$id) throw new IllogicalValuesException('No especifico id', 500);

        $data = $model->findDetailDenounce($id);

        return $this->respond($data, 200);

    }

    public function updateDenounceState() {

        $model = new Denounce();

        [ 
            "newState" => $newState, 
            "idDenounce" => $idDenounce, 
            "description" => $description 
        ] = $this->request->getJSON(assoc: true);

        $response = $model->updateDenounceState($idDenounce, $description, $newState);

        return $this->respond($response, 200);

    }

    public function findDenounceTracking() { 

        $model = new Denounce();

        $id = $this->request->getGet('idDenounce');
        $consultant = $this->request->getGet('consultant');
        $showAll = $this->request->getGet('showAll');

        $id = $id ? (int) $id : 1;
        $consultant = $consultant ? $consultant : 'CIVIL';
        $showAll = $showAll ? filter_var(trim($showAll), FILTER_VALIDATE_BOOLEAN) : false;

        $data = $model->findDenounceTracking($id, $consultant, $showAll);

        return $this->respond($data, 200);

    }

    public function findPublicInformationByDenounceId() {

        $model = new Denounce();

        $id = $this->request->getGet('idDenounce');

        if (!$id) throw new IllogicalValuesException('No especifico id', 500);

        $data = $model->findPublicInformationByDenounceId($id);

        return $this->respond($data, 200);

    }

    public function deleteDenounceState() { 

        $model = new DenounceAction();

        $id = $this->request->getGet('idTracking');

        if (!$id) throw new IllogicalValuesException('No especifico id', 500);

        $respond = $model->deleteDenounceState($id);

        return $this->respond($respond, 200);

    }

    public function requestProof() {

        $filename = $this->request->getGet('filename');

        $projectDir = dirname(getcwd());

        $uploads = $projectDir . '/storage/uploads';

        $_filename = basename($filename);

        $filePath = $uploads .'/'. $_filename;

        $bytes = file_get_contents($filePath);

        $resp['bytes'] = base64_encode($bytes);

        return $this->respond($resp, 200);

    }

}

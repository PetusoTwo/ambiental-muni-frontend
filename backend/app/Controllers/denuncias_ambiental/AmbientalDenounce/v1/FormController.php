<?php

namespace App\Controllers\denuncias_ambiental\AmbientalDenounce\v1;

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

    public function requestPDF()
{
    $model = new Denounce();
    $id = $this->request->getGet('id');

    if (!$id) {
        throw new \RuntimeException('No se especificó un ID de denuncia', 500);
    }

    $pdfData = $model->findDenounceForPDFById($id);

    if (empty($pdfData)) {
        throw new \RuntimeException('No se encontraron datos para la denuncia con ID: ' . $id, 404);
    }

    
    $denouncerName = ($pdfData['denouncer_is_natural'] ?? 1) == 1
        ? ($pdfData['denouncer_name'] ?? 'S/N') . '-' . ($pdfData['denouncer_paternal_surname'] ?? 'S/A') . '-' . ($pdfData['denouncer_mother_surname'] ?? 'S/A')
        : ($pdfData['denouncer_trade_name'] ?? 'SIN RAZÓN SOCIAL');

    $denouncedName = ($pdfData['denounced_is_natural'] ?? 1) == 1
        ? ($pdfData['denounced_name'] ?? 'S/N') . '-' . ($pdfData['denounced_paternal_surname'] ?? 'S/A') . '-' . ($pdfData['denounced_mother_surname'] ?? 'S/A')
        : ($pdfData['denounced_trade_name'] ?? 'SIN RAZÓN SOCIAL');


    $dataForPDF = [
        // Aspectos generales
        "reception_media" => $pdfData['receptionMedia'] ?? 'NO ESPECIFICA',
        "code" => $pdfData['code'] ?? 'NO ESPECIFICA',
        "date" => $pdfData['date'] ?? date('Y-m-d'),

        "denouncerDocNumber" => $pdfData['denouncer_doc_number'] ?? 'SIN DATOS',
        "denouncer" => $denouncerName, 
        "denouncerLegalRepresentator" => $pdfData['denouncer_legal_representator'] ?? 'NO ESPECIFICA',
        "denouncerAddress" => $pdfData['denouncer_address'] ?? 'SIN DATOS',
        "denouncerFixedPhone" => $pdfData['denouncer_fixed_phone'] ?? 'NO TIENE',
        "denouncerFirstPhone" => $pdfData['denouncer_first_phone'] ?? 'NO TIENE',
        "denouncerSecondPhone" => $pdfData['denouncer_second_phone'] ?? 'NO TIENE',
        "denouncerEmail" => $pdfData['denouncer_email'] ?? 'NO TIENE',

        "denouncedDocNumber" => $pdfData['denounced_doc_number'] ?? 'SIN DATOS',
        "denounced" => $denouncedName, 
        "denouncedLegalRepresentator" => $pdfData['denounced_legal_representator'] ?? 'NO ESPECIFICA',
        "denouncedAddress" => $pdfData['denounced_address'] ?? 'SIN DATOS',
        "denouncedFixedPhone" => $pdfData['denounced_fixed_phone'] ?? 'NO TIENE',
        "denouncedFirstPhone" => $pdfData['denounced_first_phone'] ?? 'NO TIENE',
        "denouncedSecondPhone" => 'NO TIENE',

        "hasPreviousDenounce" => (int) ($pdfData['hasPreviousDenounce'] ?? 0),
        "hasResponse" => (int) ($pdfData['hasResponseDenounce'] ?? 0),
        "directedEntity" => $pdfData['directedEntity'] ?? 'NO ESPECIFICA',
        "entityResponse" => $pdfData['entityResponse'] ?? 'NO ESPECIFICA',
        "comunicationMedia" => $pdfData['communicationMedia'] ?? 'NO ESPECIFICA',
        "source" => $pdfData['source'] ?? 'NO ESPECIFICA',
        "keepIdentity" => (int) ($pdfData['keepIdentity'] ?? 0),
        "address" => $pdfData['facts_address'] ?? 'NO TIENE',
        "reference" => $pdfData['facts_reference'] ?? 'NO TIENE',
        "factsDescription" => $pdfData['factsDescription'] ?? 'NO TIENE',
        "ambientalPromise" => $pdfData['ambientalPromise'] ?? 'NO TIENE',
        "proofDescription" => $pdfData['proofDescription'] ?? 'NO ESPECIFICA',
        "ambientalCauses" => $pdfData['ambientalCauses'] ?? ''
    ];

    $export = new \App\Libraries\AmbientalDenounce\ExportPDF($dataForPDF);
    $export->create();

    $this->response->setContentType('application/pdf');
}

    
    public function saveForm() 
{
    try {
        // Validate input JSON
        $formData = $this->request->getJSON(true);
        if (!isset($formData['proof']) || !isset($formData['proof']['proofData'])) {
            return $this->respond(new Response(false, "Datos del formulario inválidos"), 400);
        }

        // Setup storage paths
        $projectDir = dirname(getcwd());
        $storagePath = $projectDir . '/storage/uploads/';

        // Create storage directory if it doesn't exist
        if (!is_dir($storagePath)) {
            if (!mkdir($storagePath, 0777, true)) {
                throw new Exception("No se pudo crear el directorio de almacenamiento");
            }
        }

        $tempFiles = [];
        $files = $formData['proof']['proofData'];

        // Process files if any
        if (!empty($files)) {
            foreach ($files as $file) {
                if (!isset($file['data']) || !isset($file['proofPath']) || !isset($file['proofType'])) {
                    throw new Exception("Datos de archivo incompletos");
                }

                $safeFileName = basename($file['proofPath']);
                $fullPath = $storagePath . $safeFileName;

                $fileBuffer = base64_decode($file['data'], true);
                if ($fileBuffer === false) {
                    throw new Exception("Error decodificando archivo: " . $file['name']);
                }

                if (file_put_contents($fullPath, $fileBuffer) === false) {
                    throw new Exception("Error guardando archivo: " . $file['name']);
                }

                $formatValidator = new FileFormatValidator($file['proofType'], $fullPath);
                $tempFiles[] = $formatValidator;

                if (!$formatValidator->isValid()) {
                    foreach ($tempFiles as $tempFile) {
                        @unlink($tempFile->getPath());
                    }
                    return $this->respond(new Response(false, 
                        "Formato inválido en archivo " . $file['name']), 400);
                }
            }
        }

        // Start database transaction
        helper('form_helper');
        $db = \Config\Database::connect();
        $db->transException(true)->transStart();

        // Extract form data
        $generalAspects = $formData['generalAspects'] ?? null;
        $previousDenounce = $formData['previousDenounce'] ?? null;
        $ambientalPromises = $formData['ambientalPromises'] ?? null;
        $proof = $formData['proof'] ?? null;

        if (!$generalAspects || !$previousDenounce || !$ambientalPromises) {
            throw new Exception("Datos del formulario incompletos");
        }

        // Get table instances
        $denounceTbl = $db->table('denounce');
        $personTbl = $db->table('person');
        $personDenounceTbl = $db->table('person_denounce');
        $denounceAmbientalCauseTbl = $db->table('denounce_ambiental_cause');
        $denounceActionTbl = $db->table('denounce_action');
        $proofTbl = $db->table('proof');

        // Process form data
        $denounceData = getDenounceData($generalAspects, $previousDenounce, $ambientalPromises, $proof);
        $denouncerData = getPersonData($formData['denouncer']);
        $denouncedData = getPersonData($formData['denounced']);

        // Insert main denounce
        if (!$denounceTbl->insert($denounceData)) {
            throw new Exception("Error al guardar la denuncia");
        }
        $idDenounce = $db->insertID();

        // Insert denunciante (siempre requerido)
        if (!$personTbl->insert($denouncerData)) {
            throw new Exception("Error al guardar datos del denunciante");
        }
        $idDenouncer = $db->insertID();

        // Relación del denunciante
        $personDenouncerData = getPersonDenounceData($idDenounce, $idDenouncer, true);
        $personDenounceTbl->insert($personDenouncerData);

        // Insert denunciado solo si tiene datos
        $idDenounced = null;
        if (!empty($formData['denounced'])) {
            $hasData = false;
            foreach ($formData['denounced'] as $value) {
                if (!empty($value)) {
                    $hasData = true;
                    break;
                }
            }

            if ($hasData) {
                if (!$personTbl->insert($denouncedData)) {
                    throw new Exception("Error al guardar datos del denunciado");
                }
                $idDenounced = $db->insertID();

                // Relación con la denuncia
                $personDenouncedData = getPersonDenounceData($idDenounce, $idDenounced, false);
                $personDenounceTbl->insert($personDenouncedData);
            }
        }

        // Insert initial status
        $denounceActionTbl->insert([
            "id_denounce" => $idDenounce,
            "id_denounce_status" => 1,
            "description" => "Se registró la denuncia"
        ]);

        // Process environmental causes
        foreach ($ambientalPromises['causes'] as $cause) {
            $denounceAmbientalCauseTbl->insert([
                "id_ambiental_cause" => $cause,
                "id_denounce" => $idDenounce
            ]);
        }

        // Process proof files
        if (!empty($files)) {
            foreach ($files as $file) {
                $proofTbl->insert([
                    "id_denounce" => $idDenounce,
                    "path" => $file['proofPath']
                ]);
            }
        }

        // Send confirmation email
        $email = new EmailProvider();
        $emailName = $denouncerData['is_natural_person'] ? $denouncerData['name'] : $denouncerData['trade_name'];
        $email->sendEmail($denouncerData['email'], $emailName, $idDenounce, $denounceData['ambiental_promise']);

        // Complete transaction
        $db->transComplete();

        return $this->respond(new Response(true, "Denuncia enviada satisfactoriamente"), 200);

    } catch (Exception $e) {
        if (!empty($tempFiles)) {
            foreach ($tempFiles as $tempFile) {
                @unlink($tempFile->getPath());
            }
        }

        log_message('error', '[SaveForm] ' . $e->getMessage());

        return $this->respond(new Response(false, 
            "Ha ocurrido un error en el servidor: " . $e->getMessage()), 500);
    }
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

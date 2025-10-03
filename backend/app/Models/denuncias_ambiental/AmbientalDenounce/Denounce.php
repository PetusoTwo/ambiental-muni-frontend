<?php

namespace App\Models\denuncias_ambiental\AmbientalDenounce;

use App\Libraries\AmbientalDenounce\Response;
use CodeIgniter\Model;

class Denounce extends Model
{
    protected $table            = 'denounce';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'code',
        'reception_media',
        'date',
        'has_previous_denounce',
        'has_response',
        'directed_entity',
        'entity_response',
        'communication_media',
        'source',
        'keep_identity',
        'address',
        'reference',
        'facts_description',
        'ambiental_promise',
        'proof_description'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [
        'id' => 'int',
        'has_previous_denounce' => 'int-bool',
        'has_response' => 'int-bool',
        'keep_identity' => 'int-bool',
    ];
    protected array $castHandlers = [];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'date';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    public function findDenounceForPDFById(int $id): array {

        $sql = 'CALL usp_findDenounceForPDFById(?)';

        return $this->db->query($sql, [$id])->getResultArray()[0];

    }

    public function findDenouncesByOffset(int | null $denouncerDocNumber, int | null $denouncedDocNumber, string | null $date, string | null $denounceType, int $offset): array {

        $sql = 'CALL usp_findDenouncesByOffset(?, ?, ?, ?, ?, @realRegisters)';

        $result = $this->db->query($sql, [$denouncerDocNumber, $denouncedDocNumber, $date, $denounceType, $offset])->getResultArray();
        $realRegister = (int) $this->db->query('SELECT @realRegisters')->getRowArray(0)['@realRegisters'];

        $castedResult = [];

        foreach($result as $data) {
            $data['idDenounce'] = (int) $data['idDenounce'];
            $data['anonymous'] = (int) $data['anonymous'];
            array_push($castedResult, $data);
        }

        return [
            'denounces' => $castedResult,
            'registers' => $realRegister
        ];
    }

    public function findDetailDenounce(int $id) {

        $sql = 'CALL usp_findDetailDenounce(?)';
        
        $result = $this->db->query($sql, [$id])->getResultArray();

        $castedResult = [];

        foreach($result as $data) {
            $data['hasPreviousDenounce'] = (int) $data['hasPreviousDenounce'];
            $data['hasResponse'] = (int) $data['hasResponse'];
            $data['keepIdentity'] = (int) $data['keepIdentity'];
            array_push($castedResult, $data);
        }

        return $castedResult;

    }

    public function updateDenounceState(int $id, string $description, int $newState): Response {

        $sql = 'CALL usp_updateStateDenounce(?, ?, ?)';

        $this->db->query($sql, [$id, $newState, $description]);

        return new Response(true, "Actualizacion de estado exitosa");

    }

    public function findDenounceTracking(int $id, string $consultant, bool $showAll): array {

        $sql = 'CALL usp_findDenounceTracking(?, ?, ?)';

        $result = $this->db->query($sql, [$id, $consultant, $showAll])->getResultArray();

        $castedResult = [];

        foreach($result as $data) {

            $data['idDenounce'] = (int) $data['idDenounce'];

            if ($consultant === 'ADMIN' && $showAll) $data['idTracking'] = (int) $data['idTracking'];

            array_push($castedResult, $data);

        }

        return $castedResult;

    }

    public function findPublicInformationByDenounceId(int $id): array {

        $sql = 'CALL usp_findPublicInformationByDenounceId(?)';

        $result = $this->db->query($sql, [$id])->getResultArray();

        $castedResult = [];

        foreach($result as $data) {

            $data['isNatural'] = (int) $data['isNatural'];

            array_push($castedResult, $data);

        }

        return $castedResult;
        
    }

}

<?php

namespace App\Models\denuncias_ambiental\AmbientalDenounce;

use App\Libraries\AmbientalDenounce\Response;
use CodeIgniter\Model;

class DenounceAction extends Model
{
    protected $table            = 'denounce_action';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'id_denounce',
        'id_denounce_status',
        'description',
        'date'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [
        'id' => 'int',
        'id_denounce' => 'int',
        'id_denounce_status' => 'int'
    ];
    protected array $castHandlers = [];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'timestap';
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

    public function deleteDenounceState(int $id): Response
    {
        $sql = "CALL usp_deleteTracking(?)";
        $this->db->query($sql, [$id])->getResultArray();
        return new Response(true, "Eliminacion de estado exitosa");
    }
}

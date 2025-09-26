<?php

namespace App\Models\denuncias_ambiental\AmbientalDenounce;

use CodeIgniter\Model;

class Person extends Model
{
    protected $table            = 'person';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'id_doc_type',
        'is_natural_person',
        'doc_number',
        'trade_name',
        'name',
        'paternal_surname',
        'mother_surname',
        'legal_representator',
        'address',
        'fixed_phone',
        'first_phone',
        'second_phone',
        'email',
        'departament',
        'province',
        'distric'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [
        'id' => 'int',
        'id_doc_type' => 'int',
        'is_natural_person' => 'int-bool'
    ];
    protected array $castHandlers = [];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
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
}

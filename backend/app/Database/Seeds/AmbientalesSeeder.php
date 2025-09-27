<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AmbientalesSeeder extends Seeder
{
    public function run()
    {
        // ambiental_cause
        $this->db->table('ambiental_cause')->insertBatch([
            [
                'id'   => 1,
                'type' => 'Emisiones de Gases y Humos'
            ],
            [
                'id'   => 2,
                'type' => 'Vertimiento de Liquidos'
            ],
            [
                'id'   => 3,
                'type' => 'Vertimiento de Solidos'
            ],
            [
                'id'   => 4,
                'type' => 'Material Particulado'
            ],
            [
                'id'   => 5,
                'type' => 'Ruidos'
            ],
        ]);

        // denounce_status
        $this->db->table('denounce_status')->insertBatch([
            [
                'id'   => 1,
                'type' => 'REGISTRADO'
            ],
            [
                'id'   => 2,
                'type' => 'RECIBIDO'
            ],
            [
                'id'   => 3,
                'type' => 'ATENDIDO'
            ],
        ]);

        // document_type
        $this->db->table('document_type')->insertBatch([
            [
                'id'   => 1,
                'type' => 'DNI'
            ],
            [
                'id'   => 2,
                'type' => 'RUC'
            ],
        ]);

        // user
        $this->db->table('user')->insertBatch([
            [
                'id'              => 1,
                'name'            => 'Informatica',
                'mother_surname'  => 'MDJLO',
                'paternal_surname'=> 'MDJLO',
                'email'           => 'informatica@gmail.com',
                'password' => password_hash('informatica', PASSWORD_DEFAULT),
            ]
        ]);
    }
}
